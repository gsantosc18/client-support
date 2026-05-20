package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/pkg/utils"
	"github.com/google/uuid"
)

type AuthService struct {
	userRepo      domain.UserRepository
	companyRepo   domain.CompanyRepository
	emailService  EmailService
	blacklistRepo interface { // simplified here, would ideally be an interface in domain
		Add(ctx context.Context, token string, expiration time.Duration) error
		IsBlacklisted(ctx context.Context, token string) (bool, error)
	}
}

func NewAuthService(
	userRepo domain.UserRepository,
	companyRepo domain.CompanyRepository,
	emailService EmailService,
	blacklistRepo interface {
		Add(ctx context.Context, token string, expiration time.Duration) error
		IsBlacklisted(ctx context.Context, token string) (bool, error)
	},
) *AuthService {
	return &AuthService{
		userRepo:      userRepo,
		companyRepo:   companyRepo,
		emailService:  emailService,
		blacklistRepo: blacklistRepo,
	}
}

type RegisterRequest struct {
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Email           string    `json:"email"`
	Phone           string    `json:"phone"`
	BirthDate       time.Time `json:"birth_date"`
	Password        string    `json:"password"`
	PasswordConfirm string    `json:"password_confirm"`
	CompanyID       uuid.UUID `json:"company_id"`
	TermsAccepted   bool      `json:"terms_accepted"`
}

func (s *AuthService) Register(req RegisterRequest) error {
	if !req.TermsAccepted {
		return errors.New("é necessário aceitar os termos de uso")
	}
	if req.Password != req.PasswordConfirm {
		return errors.New("a senha e a confirmação devem ser iguais")
	}

	company, err := s.companyRepo.FindByID(req.CompanyID)
	if err != nil {
		return errors.New("companhia inválida ou não encontrada")
	}
	if company.Status != domain.CompanyStatusActive {
		return errors.New("a companhia informada não está ativa")
	}

	existingUser, _ := s.userRepo.FindByEmailAndCompany(req.Email, req.CompanyID)
	if existingUser != nil {
		return errors.New("já existe um usuário com este e-mail na companhia")
	}

	fullName := fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	err = utils.ValidatePassword(req.Password, fullName, req.Email, req.Phone)
	if err != nil {
		return err
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		return err
	}

	phonePtr := &req.Phone
	if req.Phone == "" {
		phonePtr = nil
	}

	user := &domain.User{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Phone:     phonePtr,
		BirthDate: req.BirthDate,
		Password:  hashedPassword,
		CompanyID: req.CompanyID,
	}

	return s.userRepo.Create(user)
}

func (s *AuthService) Login(email, password string, companyID uuid.UUID, keepMeLoggedIn bool) (*utils.TokenPair, error) {
	user, err := s.userRepo.FindByEmailAndCompany(email, companyID)
	if err != nil {
		return nil, errors.New("credenciais inválidas") // Mensagem amigável e genérica
	}

	if user.LockedUntil != nil && user.LockedUntil.After(time.Now()) {
		return nil, errors.New("usuário bloqueado por excesso de tentativas. Tente novamente mais tarde")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		user.FailedLoginAttempts++
		if user.FailedLoginAttempts >= 3 {
			lockedUntil := time.Now().Add(30 * time.Minute)
			user.LockedUntil = &lockedUntil
		}
		s.userRepo.Update(user)
		return nil, errors.New("credenciais inválidas")
	}

	// Login sucesso, resetar falhas
	if user.FailedLoginAttempts > 0 || user.LockedUntil != nil {
		user.FailedLoginAttempts = 0
		user.LockedUntil = nil
		s.userRepo.Update(user)
	}

	tokens, err := utils.GenerateTokenPair(user.ID, user.CompanyID, keepMeLoggedIn)
	if err != nil {
		return nil, err
	}

	return tokens, nil
}

func (s *AuthService) RecoverPassword(email string, companyID uuid.UUID) error {
	user, err := s.userRepo.FindByEmailAndCompany(email, companyID)
	if err != nil || user.Status != domain.UserStatusActive {
		// Não expor se o usuário existe, retorna nil silenciosamente conforme especificação
		return nil
	}

	company, err := s.companyRepo.FindByID(companyID)
	if err != nil {
		return nil
	}

	token := uuid.New().String()
	recoveryToken := &domain.PasswordRecoveryToken{
		UserID:    user.ID,
		Token:     token,
		ExpiresAt: time.Now().Add(15 * time.Minute),
	}

	err = s.userRepo.SaveRecoveryToken(recoveryToken)
	if err != nil {
		return nil // Pode logar o erro, mas não expõe para o usuário
	}

	recoveryLink := fmt.Sprintf("http://localhost:3000/reset-password?token=%s", token)
	go s.emailService.SendPasswordRecoveryEmail(user.Email, company.Name, recoveryLink)

	return nil
}

func (s *AuthService) ResetPassword(tokenStr, newPassword, newPasswordConfirm string) error {
	if newPassword != newPasswordConfirm {
		return errors.New("as senhas não conferem")
	}

	recoveryToken, err := s.userRepo.FindRecoveryToken(tokenStr)
	if err != nil || recoveryToken.Used || recoveryToken.ExpiresAt.Before(time.Now()) {
		return errors.New("token inválido ou expirado")
	}

	user, err := s.userRepo.FindByID(recoveryToken.UserID)
	if err != nil {
		return errors.New("usuário não encontrado")
	}

	fullName := fmt.Sprintf("%s %s", user.FirstName, user.LastName)
	phone := ""
	if user.Phone != nil {
		phone = *user.Phone
	}
	err = utils.ValidatePassword(newPassword, fullName, user.Email, phone)
	if err != nil {
		return err
	}

	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	user.Password = hashedPassword
	err = s.userRepo.Update(user)
	if err != nil {
		return err
	}

	return s.userRepo.MarkRecoveryTokenUsed(recoveryToken.ID)
}

func (s *AuthService) Logout(ctx context.Context, token string) error {
	// Pega o token de acesso (validade de 30 minutos, vamos botar 30m na blacklist)
	return s.blacklistRepo.Add(ctx, token, 30*time.Minute)
}
