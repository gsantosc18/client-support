package service

import (
	"errors"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type ProcessService struct {
	processRepo domain.ProcessRepository
	clientRepo  domain.ClientRepository
	userRepo    domain.UserRepository
	companyRepo domain.CompanyRepository
}

func NewProcessService(
	processRepo domain.ProcessRepository,
	clientRepo domain.ClientRepository,
	userRepo domain.UserRepository,
	companyRepo domain.CompanyRepository,
) *ProcessService {
	return &ProcessService{
		processRepo: processRepo,
		clientRepo:  clientRepo,
		userRepo:    userRepo,
		companyRepo: companyRepo,
	}
}

func (s *ProcessService) Create(process *domain.Process) error {
	// 1. Validar empresa ativa
	company, err := s.companyRepo.FindByID(process.CompanyID)
	if err != nil {
		return errors.New("empresa inválida ou não encontrada")
	}
	if company.Status != domain.CompanyStatusActive {
		return errors.New("a empresa informada está inativa ou suspensa")
	}

	// 2. Validar se o cliente pertence à mesma empresa
	client, err := s.clientRepo.FindByIDAndCompany(process.ClientID, process.CompanyID)
	if err != nil {
		return errors.New("cliente inválido ou não pertencente a esta empresa")
	}
	if client.Status != domain.ClientStatusActive {
		return errors.New("não é possível abrir um processo para um cliente inativo ou suspenso")
	}

	// 3. Validar se o usuário operador existe e pertence à mesma empresa
	user, err := s.userRepo.FindByID(process.UserID)
	if err != nil {
		return errors.New("operador inválido ou não encontrado")
	}
	if user.CompanyID != process.CompanyID {
		return errors.New("o operador informado não pertence a esta empresa")
	}
	if user.Status != domain.UserStatusActive {
		return errors.New("não é possível atribuir o processo a um operador inativo ou suspenso")
	}

	// 4. Validar unicidade do ID externo se informado
	if process.ExternalID != nil && *process.ExternalID != "" {
		exists, err := s.processRepo.ExistsExternalIDInCompany(*process.ExternalID, process.CompanyID, nil)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este ID externo já está sendo utilizado em outro processo nesta empresa")
		}
	}

	// 5. Configurar padrão
	process.Status = domain.ProcessStatusStarted

	return s.processRepo.Create(process)
}

func (s *ProcessService) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	return s.processRepo.FindByIDAndCompany(id, companyID)
}

func (s *ProcessService) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, externalID string, page int, limit int) ([]*domain.Process, int, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	return s.processRepo.FindAll(companyID, clientID, userID, status, externalID, page, limit)
}

func (s *ProcessService) Update(process *domain.Process) error {
	// 1. Carregar processo existente
	existing, err := s.processRepo.FindByIDAndCompany(process.ID, process.CompanyID)
	if err != nil {
		return errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	// 2. Validar se o cliente pertence à mesma empresa
	client, err := s.clientRepo.FindByIDAndCompany(process.ClientID, process.CompanyID)
	if err != nil {
		return errors.New("cliente inválido ou não pertencente a esta empresa")
	}
	if client.Status != domain.ClientStatusActive {
		return errors.New("cliente informado está inativo ou suspenso")
	}

	// 3. Validar operador
	user, err := s.userRepo.FindByID(process.UserID)
	if err != nil {
		return errors.New("operador inválido ou não encontrado")
	}
	if user.CompanyID != process.CompanyID {
		return errors.New("o operador informado não pertence a esta empresa")
	}
	if user.Status != domain.UserStatusActive {
		return errors.New("operador informado está inativo ou suspenso")
	}

	// 4. Validar ID externo se informado
	if process.ExternalID != nil && *process.ExternalID != "" {
		exists, err := s.processRepo.ExistsExternalIDInCompany(*process.ExternalID, process.CompanyID, &process.ID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este ID externo já está sendo utilizado em outro processo nesta empresa")
		}
	}

	existing.ClientID = process.ClientID
	existing.UserID = process.UserID
	existing.ExternalID = process.ExternalID

	return s.processRepo.Update(existing)
}

func (s *ProcessService) UpdateStatus(id uuid.UUID, companyID uuid.UUID, status domain.ProcessStatus) error {
	// 1. Validar valor do status
	switch status {
	case domain.ProcessStatusStarted, domain.ProcessStatusPending, domain.ProcessStatusInProgress, domain.ProcessStatusCompleted, domain.ProcessStatusCancelled:
		// válido
	default:
		return errors.New("status de processo inválido")
	}

	// 2. Carregar processo
	process, err := s.processRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	process.Status = status
	return s.processRepo.Update(process)
}
