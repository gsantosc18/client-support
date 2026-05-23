package service

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type UserService struct {
	userRepo domain.UserRepository
}

func NewUserService(userRepo domain.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) ListByCompany(companyID uuid.UUID) ([]*domain.User, error) {
	return s.userRepo.FindAllByCompany(companyID)
}
