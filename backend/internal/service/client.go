package service

import (
	"errors"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type ClientService struct {
	clientRepo  domain.ClientRepository
	companyRepo domain.CompanyRepository
	processRepo domain.ProcessRepository
}

func NewClientService(clientRepo domain.ClientRepository, companyRepo domain.CompanyRepository, processRepo domain.ProcessRepository) *ClientService {
	return &ClientService{
		clientRepo:  clientRepo,
		companyRepo: companyRepo,
		processRepo: processRepo,
	}
}

func (s *ClientService) Create(client *domain.Client) error {
	// 1. Validar se a empresa está cadastrada e ativa
	company, err := s.companyRepo.FindByID(client.CompanyID)
	if err != nil {
		return errors.New("empresa inválida ou não encontrada")
	}
	if company.Status != domain.CompanyStatusActive {
		return errors.New("a empresa informada está inativa ou suspensa")
	}

	// 2. Validar se o nome está preenchido
	if client.FullName == "" {
		return errors.New("o nome completo do cliente é obrigatório")
	}

	// 3. Validar unicidade dos campos opcionais na empresa
	if err := s.validateUniqueness(client, nil); err != nil {
		return err
	}

	// 4. Configurar campos padrão
	client.Status = domain.ClientStatusActive

	return s.clientRepo.Create(client)
}

func (s *ClientService) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Client, error) {
	return s.clientRepo.FindByIDAndCompany(id, companyID)
}

func (s *ClientService) FindAll(companyID uuid.UUID, search string, status string, page int, limit int) ([]*domain.Client, int, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 100 {
		limit = 10
	}
	return s.clientRepo.FindAll(companyID, search, status, page, limit)
}

func (s *ClientService) Update(client *domain.Client) error {
	// 1. Verificar se o cliente existe
	existing, err := s.clientRepo.FindByIDAndCompany(client.ID, client.CompanyID)
	if err != nil {
		return errors.New("cliente não encontrado ou não pertence a esta empresa")
	}

	if client.FullName == "" {
		return errors.New("o nome completo do cliente é obrigatório")
	}

	// 2. Validar unicidade de documentos, excluindo o ID atual
	if err := s.validateUniqueness(client, &client.ID); err != nil {
		return err
	}

	// Preservar campos não editados diretamente ou metadados se necessário
	existing.FullName = client.FullName
	existing.Email = client.Email
	existing.Phone = client.Phone
	existing.BirthDate = client.BirthDate
	existing.CPF = client.CPF
	existing.RG = client.RG
	existing.CNH = client.CNH
	
	if client.Status != "" {
		existing.Status = client.Status
	}

	return s.clientRepo.Update(existing)
}

func (s *ClientService) Delete(id uuid.UUID, companyID uuid.UUID) error {
	client, err := s.clientRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return errors.New("cliente não encontrado ou não pertence a esta empresa")
	}

	// Verificar se o cliente possui processos associados
	_, total, err := s.processRepo.FindAll(companyID, &id, nil, "", "", 1, 1)
	if err == nil && total > 0 {
		return errors.New("O cliente está vinculado a um processo e não pode ser removido.")
	}

	return s.clientRepo.Delete(client)
}

func (s *ClientService) validateUniqueness(client *domain.Client, excludeID *uuid.UUID) error {
	// Validar E-mail
	if client.Email != nil && *client.Email != "" {
		exists, err := s.clientRepo.ExistsByFieldAndCompany("email", *client.Email, client.CompanyID, excludeID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este e-mail já está cadastrado para outro cliente nesta empresa")
		}
	}

	// Validar CPF
	if client.CPF != nil && *client.CPF != "" {
		exists, err := s.clientRepo.ExistsByFieldAndCompany("cpf", *client.CPF, client.CompanyID, excludeID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este CPF já está cadastrado para outro cliente nesta empresa")
		}
	}

	// Validar RG
	if client.RG != nil && *client.RG != "" {
		exists, err := s.clientRepo.ExistsByFieldAndCompany("rg", *client.RG, client.CompanyID, excludeID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este RG já está cadastrado para outro cliente nesta empresa")
		}
	}

	// Validar CNH
	if client.CNH != nil && *client.CNH != "" {
		exists, err := s.clientRepo.ExistsByFieldAndCompany("cnh", *client.CNH, client.CompanyID, excludeID)
		if err != nil {
			return err
		}
		if exists {
			return errors.New("este CNH já está cadastrado para outro cliente nesta empresa")
		}
	}

	return nil
}
