package main

import (
	"fmt"
	"log"
	"strings"

	"github.com/client-support/backend/internal/config"
	handlers "github.com/client-support/backend/internal/handlers/http"
	"github.com/client-support/backend/internal/handlers/http/middleware"
	"github.com/client-support/backend/internal/repository/postgres"
	"github.com/client-support/backend/internal/repository/redis"
	"github.com/client-support/backend/internal/service"
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

	// Repositories
	userRepo := postgres.NewUserRepository(db)
	companyRepo := postgres.NewCompanyRepository(db)
	blacklistRepo := redis.NewTokenBlacklist(rdb)

	// Services
	emailService := service.NewSMTPEmailService()
	authService := service.NewAuthService(userRepo, companyRepo, emailService, blacklistRepo)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)

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

	log.Println("Server is running on port", cfg.Server.Port)
	log.Fatal(app.Listen(fmt.Sprintf(":%s", cfg.Server.Port)))
}
