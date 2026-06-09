package service

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type CompanyService struct {
	companyRepo domain.CompanyRepository
}

func NewCompanyService(companyRepo domain.CompanyRepository) *CompanyService {
	return &CompanyService{
		companyRepo: companyRepo,
	}
}

func (s *CompanyService) FindByID(id uuid.UUID) (*domain.Company, error) {
	return s.companyRepo.FindByID(id)
}
