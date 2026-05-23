package service

import (
	"errors"
	"strings"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type EstablishmentService struct {
	estRepo     domain.EstablishmentRepository
	companyRepo domain.CompanyRepository
}

func NewEstablishmentService(estRepo domain.EstablishmentRepository, companyRepo domain.CompanyRepository) *EstablishmentService {
	return &EstablishmentService{
		estRepo:     estRepo,
		companyRepo: companyRepo,
	}
}

func (s *EstablishmentService) Create(est *domain.Establishment) error {
	// 1. Validar empresa ativa
	company, err := s.companyRepo.FindByID(est.CompanyID)
	if err != nil {
		return errors.New("empresa inválida ou não encontrada")
	}
	if company.Status != domain.CompanyStatusActive {
		return errors.New("a empresa informada está inativa ou suspensa")
	}

	// 2. Validar campos
	est.Name = strings.TrimSpace(est.Name)
	if len(est.Name) < 3 {
		return errors.New("o nome do estabelecimento deve ter pelo menos 3 caracteres")
	}

	est.Address = strings.TrimSpace(est.Address)
	if len(est.Address) < 5 {
		return errors.New("o endereço do estabelecimento deve ter pelo menos 5 caracteres")
	}

	est.City = strings.TrimSpace(est.City)
	if len(est.City) < 2 {
		return errors.New("a cidade do estabelecimento deve ter pelo menos 2 caracteres")
	}

	est.State = strings.TrimSpace(strings.ToUpper(est.State))
	if len(est.State) != 2 {
		return errors.New("o estado deve ser composto por exatamente 2 caracteres (UF)")
	}

	// 3. Validar duplicidade de nome
	exists, err := s.estRepo.ExistsByNameAndCompany(est.Name, est.CompanyID, nil)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe um estabelecimento cadastrado com este nome nesta empresa")
	}

	return s.estRepo.Create(est)
}

func (s *EstablishmentService) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Establishment, error) {
	return s.estRepo.FindByIDAndCompany(id, companyID)
}

func (s *EstablishmentService) FindAll(companyID uuid.UUID, search string, page int, limit int) ([]*domain.Establishment, int, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	return s.estRepo.FindAll(companyID, search, page, limit)
}

func (s *EstablishmentService) Update(est *domain.Establishment) error {
	existing, err := s.estRepo.FindByIDAndCompany(est.ID, est.CompanyID)
	if err != nil {
		return errors.New("estabelecimento não encontrado ou não pertence a esta empresa")
	}

	// Validar campos
	est.Name = strings.TrimSpace(est.Name)
	if len(est.Name) < 3 {
		return errors.New("o nome do estabelecimento deve ter pelo menos 3 caracteres")
	}

	est.Address = strings.TrimSpace(est.Address)
	if len(est.Address) < 5 {
		return errors.New("o endereço do estabelecimento deve ter pelo menos 5 caracteres")
	}

	est.City = strings.TrimSpace(est.City)
	if len(est.City) < 2 {
		return errors.New("a cidade do estabelecimento deve ter pelo menos 2 caracteres")
	}

	est.State = strings.TrimSpace(strings.ToUpper(est.State))
	if len(est.State) != 2 {
		return errors.New("o estado deve ser composto por exatamente 2 caracteres (UF)")
	}

	// Validar duplicidade
	exists, err := s.estRepo.ExistsByNameAndCompany(est.Name, est.CompanyID, &est.ID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("já existe outro estabelecimento cadastrado com este nome nesta empresa")
	}

	existing.Name = est.Name
	existing.Address = est.Address
	existing.City = est.City
	existing.State = est.State

	return s.estRepo.Update(existing)
}
