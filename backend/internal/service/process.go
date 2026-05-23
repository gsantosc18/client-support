package service

import (
	"errors"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type ProcessService struct {
	processRepo       domain.ProcessRepository
	clientRepo        domain.ClientRepository
	userRepo          domain.UserRepository
	companyRepo       domain.CompanyRepository
	establishmentRepo domain.EstablishmentRepository
}

func NewProcessService(
	processRepo domain.ProcessRepository,
	clientRepo domain.ClientRepository,
	userRepo domain.UserRepository,
	companyRepo domain.CompanyRepository,
	establishmentRepo domain.EstablishmentRepository,
) *ProcessService {
	return &ProcessService{
		processRepo:       processRepo,
		clientRepo:        clientRepo,
		userRepo:          userRepo,
		companyRepo:       companyRepo,
		establishmentRepo: establishmentRepo,
	}
}

func (s *ProcessService) Create(process *domain.Process, clientIDs []uuid.UUID) error {
	// 1. Validar empresa ativa
	company, err := s.companyRepo.FindByID(process.CompanyID)
	if err != nil {
		return errors.New("empresa inválida ou não encontrada")
	}
	if company.Status != domain.CompanyStatusActive {
		return errors.New("a empresa informada está inativa ou suspensa")
	}

	// 2. Validar se há pelo menos 1 cliente
	if len(clientIDs) == 0 {
		return errors.New("um processo deve ter pelo menos um cliente associado")
	}

	// 3. Validar clientes
	var clients []domain.Client
	for _, cid := range clientIDs {
		client, err := s.clientRepo.FindByIDAndCompany(cid, process.CompanyID)
		if err != nil {
			return errors.New("cliente inválido ou não pertencente a esta empresa")
		}
		if client.Status != domain.ClientStatusActive {
			return errors.New("não é possível abrir um processo para um cliente inativo ou suspenso")
		}
		clients = append(clients, *client)
	}
	process.Clients = clients

	// 4. Validar estabelecimento
	establishment, err := s.establishmentRepo.FindByIDAndCompany(process.EstablishmentID, process.CompanyID)
	if err != nil {
		return errors.New("estabelecimento inválido ou não encontrado")
	}
	process.Establishment = *establishment

	// 5. Validar se o usuário operador existe e pertence à mesma empresa
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
	process.User = *user

	// 6. Configurar padrão
	process.Status = domain.ProcessStatusPending

	return s.processRepo.Create(process)
}

func (s *ProcessService) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	return s.processRepo.FindByIDAndCompany(id, companyID)
}

func (s *ProcessService) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*domain.Process, int, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	return s.processRepo.FindAll(companyID, clientID, userID, status, protocol, page, limit)
}

func (s *ProcessService) Update(process *domain.Process, clientIDs []uuid.UUID) error {
	// 1. Carregar processo existente
	existing, err := s.processRepo.FindByIDAndCompany(process.ID, process.CompanyID)
	if err != nil {
		return errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	// 2. Validar pelo menos 1 cliente
	if len(clientIDs) == 0 {
		return errors.New("um processo deve ter pelo menos um cliente associado")
	}

	// 3. Validar e carregar clientes
	var clients []domain.Client
	for _, cid := range clientIDs {
		client, err := s.clientRepo.FindByIDAndCompany(cid, process.CompanyID)
		if err != nil {
			return errors.New("cliente inválido ou não pertencente a esta empresa")
		}
		if client.Status != domain.ClientStatusActive {
			return errors.New("não é possível associar um cliente inativo ou suspenso")
		}
		clients = append(clients, *client)
	}
	existing.Clients = clients

	// 4. Validar estabelecimento
	establishment, err := s.establishmentRepo.FindByIDAndCompany(process.EstablishmentID, process.CompanyID)
	if err != nil {
		return errors.New("estabelecimento inválido ou não encontrado")
	}
	existing.EstablishmentID = process.EstablishmentID
	existing.Establishment = *establishment

	// 5. Validar operador
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
	existing.UserID = process.UserID
	existing.User = *user

	existing.Protocol = process.Protocol
	existing.Observation = process.Observation

	return s.processRepo.Update(existing)
}

func (s *ProcessService) UpdateStatus(id uuid.UUID, companyID uuid.UUID, status domain.ProcessStatus) error {
	switch status {
	case domain.ProcessStatusPending, domain.ProcessStatusInProgress, domain.ProcessStatusAwaitingDocumentation, domain.ProcessStatusInAnalysis, domain.ProcessStatusCompleted, domain.ProcessStatusCancelled:
		// válido
	default:
		return errors.New("status de processo inválido")
	}

	process, err := s.processRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	process.Status = status
	return s.processRepo.Update(process)
}

func (s *ProcessService) Delete(id uuid.UUID, companyID uuid.UUID) error {
	return s.processRepo.Delete(id, companyID)
}
