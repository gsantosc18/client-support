package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strings"

	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/client-support/backend/internal/config"
	"github.com/client-support/backend/internal/domain"
	handlers "github.com/client-support/backend/internal/handlers/http"
	"github.com/client-support/backend/internal/handlers/http/middleware"
	"github.com/client-support/backend/internal/repository/postgres"
	"github.com/client-support/backend/internal/repository/redis"
	"github.com/client-support/backend/internal/service"
	"github.com/client-support/backend/internal/storage"
	"github.com/client-support/backend/pkg/utils"
	redisclient "github.com/redis/go-redis/v9"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	gormpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load Configuration using Viper/YAML
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Falha ao carregar configurações:", err)
	}

	// Set dynamic JWT signing key
	utils.SetJWTSecret(cfg.JWT.Secret)

	// Database Connection
	db, err := gorm.Open(gormpostgres.Open(cfg.Database.URL), &gorm.Config{})
	if err != nil {
		log.Fatal("Falha ao conectar no banco de dados:", err)
	}

	// Redis Connection (handles redis:// standard URIs or pure host:port addresses)
	redisOpt := &redisclient.Options{
		Addr: cfg.Redis.URL,
	}
	if strings.HasPrefix(cfg.Redis.URL, "redis://") || strings.HasPrefix(cfg.Redis.URL, "rediss://") {
		if parsedOpt, err := redisclient.ParseURL(cfg.Redis.URL); err == nil {
			redisOpt = parsedOpt
		}
	}
	rdb := redisclient.NewClient(redisOpt)

	// Provedor de Storage (S3 se USE_S3=true, senão LocalStorage)
	var fileStorage domain.FileStorage
	useS3 := os.Getenv("USE_S3") == "true"
	if useS3 {
		awsCfg, err := awsconfig.LoadDefaultConfig(context.TODO())
		if err != nil {
			log.Fatal("Falha ao carregar AWS config:", err)
		}
		s3Client := s3.NewFromConfig(awsCfg)
		bucket := os.Getenv("AWS_BUCKET")
		if bucket == "" {
			bucket = "client-support-documents"
		}
		fileStorage = storage.NewS3Storage(s3Client, bucket)
		log.Println("Provedor de Storage configurado para AWS S3 (Bucket:", bucket, ")")
	} else {
		fileStorage = storage.NewLocalStorage("./storage")
		log.Println("Provedor de Storage configurado para Armazenamento Local (Caminho: ./storage)")
	}

	// Repositories
	userRepo := postgres.NewUserRepository(db)
	companyRepo := postgres.NewCompanyRepository(db)
	blacklistRepo := redis.NewTokenBlacklist(rdb)
	clientRepo := postgres.NewClientRepository(db)
	processRepo := postgres.NewProcessRepository(db)
	estRepo := postgres.NewEstablishmentRepository(db)
	annoRepo := postgres.NewAnnotationRepository(db)
	docRepo := postgres.NewDocumentRepository(db)

	// Services
	emailService := service.NewSMTPEmailService()
	authService := service.NewAuthService(userRepo, companyRepo, emailService, blacklistRepo)
	clientService := service.NewClientService(clientRepo, companyRepo, processRepo)
	estService := service.NewEstablishmentService(estRepo, companyRepo)
	processService := service.NewProcessService(processRepo, clientRepo, userRepo, companyRepo, estRepo)
	userService := service.NewUserService(userRepo)
	annoService := service.NewAnnotationService(annoRepo, processRepo)
	docService := service.NewDocumentService(docRepo, fileStorage, processRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	clientHandler := handlers.NewClientHandler(clientService)
	estHandler := handlers.NewEstablishmentHandler(estService)
	processHandler := handlers.NewProcessHandler(processService)
	userHandler := handlers.NewUserHandler(userService)
	annoHandler := handlers.NewAnnotationHandler(annoService)
	docHandler := handlers.NewDocumentHandler(docService)

	// Fiber App
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Em prod deve ser restrito
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Routes
	api := app.Group("/api")
	auth := api.Group("/auth")

	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/forgot-password", authHandler.RecoverPassword)
	auth.Post("/reset-password", authHandler.ResetPassword)
	
	// Rota de logout protegida pelo middleware JWT para invalidar e colocar na blacklist
	auth.Post("/logout", middleware.Protected(blacklistRepo), authHandler.Logout)

	// Rotas de Clientes (Clientes)
	clients := api.Group("/clients", middleware.Protected(blacklistRepo))
	clients.Post("/", clientHandler.Create)
	clients.Get("/", clientHandler.List)
	clients.Get("/:id", clientHandler.GetByID)
	clients.Put("/:id", clientHandler.Update)
	clients.Delete("/:id", clientHandler.Delete)

	// Rotas de Estabelecimentos
	establishments := api.Group("/establishments", middleware.Protected(blacklistRepo))
	establishments.Post("/", estHandler.Create)
	establishments.Get("/", estHandler.List)

	// Rotas de Usuários / Operadores
	users := api.Group("/users", middleware.Protected(blacklistRepo))
	users.Get("/", userHandler.List)

	// Rotas de Processos (Processos)
	processes := api.Group("/processes", middleware.Protected(blacklistRepo))
	processes.Post("/", processHandler.Create)
	processes.Get("/", processHandler.List)
	processes.Get("/:id", processHandler.GetByID)
	processes.Put("/:id", processHandler.Update)
	processes.Patch("/:id/status", processHandler.UpdateStatus)
	processes.Delete("/:id", processHandler.Delete)

	// Rotas de Anotações de Processo
	processes.Post("/:id/annotations", annoHandler.Create)
	processes.Get("/:id/annotations", annoHandler.List)
	processes.Put("/:id/annotations/:annotation_id", annoHandler.Update)
	processes.Delete("/:id/annotations/:annotation_id", annoHandler.Delete)

	// Rotas de Gerenciamento de Documentos
	processes.Post("/:id/documents", docHandler.Upload)
	processes.Get("/:id/documents", docHandler.List)
	processes.Get("/:id/documents/:document_id/download", docHandler.Download)
	processes.Put("/:id/documents/:document_id", docHandler.Update)
	processes.Delete("/:id/documents/:document_id", docHandler.Delete)

	log.Println("Server is running on port", cfg.Server.Port)
	log.Fatal(app.Listen(fmt.Sprintf(":%s", cfg.Server.Port)))
}
