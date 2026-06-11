package service

import (
	"errors"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/pkg/utils"
	"github.com/google/uuid"
)

type ClientVaultService struct {
	vaultRepo  domain.ClientVaultRepository
	clientRepo domain.ClientRepository
	vaultKey   string
}

func NewClientVaultService(vaultRepo domain.ClientVaultRepository, clientRepo domain.ClientRepository, vaultKey string) *ClientVaultService {
	return &ClientVaultService{
		vaultRepo:  vaultRepo,
		clientRepo: clientRepo,
		vaultKey:   vaultKey,
	}
}

func (s *ClientVaultService) Create(item *domain.ClientVaultItem) error {
	// Verify client exists and belongs to company
	_, err := s.clientRepo.FindByIDAndCompany(item.ClientID, item.CompanyID)
	if err != nil {
		return errors.New("cliente não encontrado ou não pertence a esta empresa")
	}

	if item.Title == "" {
		return errors.New("o título da credencial é obrigatório")
	}
	if item.Password == "" {
		return errors.New("a senha é obrigatória")
	}

	// Encrypt password
	encryptedPassword, err := utils.Encrypt(item.Password, s.vaultKey)
	if err != nil {
		return err
	}
	item.Password = encryptedPassword

	// Encrypt notes
	if item.Notes != nil && *item.Notes != "" {
		encryptedNotes, err := utils.Encrypt(*item.Notes, s.vaultKey)
		if err != nil {
			return err
		}
		item.Notes = &encryptedNotes
	}

	return s.vaultRepo.Create(item)
}

func (s *ClientVaultService) FindAllByClient(clientID uuid.UUID, companyID uuid.UUID) ([]*domain.ClientVaultItem, error) {
	_, err := s.clientRepo.FindByIDAndCompany(clientID, companyID)
	if err != nil {
		return nil, errors.New("cliente não encontrado ou não pertence a esta empresa")
	}

	items, err := s.vaultRepo.FindAllByClient(clientID, companyID)
	if err != nil {
		return nil, err
	}

	// Hide password and notes on lists
	for _, item := range items {
		item.Password = ""
		item.Notes = nil
	}

	return items, nil
}

func (s *ClientVaultService) FindByIDAndCompany(id uuid.UUID, clientID uuid.UUID, companyID uuid.UUID) (*domain.ClientVaultItem, error) {
	_, err := s.clientRepo.FindByIDAndCompany(clientID, companyID)
	if err != nil {
		return nil, errors.New("cliente não encontrado ou não pertence a esta empresa")
	}

	item, err := s.vaultRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return nil, errors.New("item do cofre não encontrado")
	}

	if item.ClientID != clientID {
		return nil, errors.New("item não pertence ao cliente informado")
	}

	// Decrypt password
	decryptedPassword, err := utils.Decrypt(item.Password, s.vaultKey)
	if err != nil {
		return nil, err
	}
	item.Password = decryptedPassword

	// Decrypt notes
	if item.Notes != nil && *item.Notes != "" {
		decryptedNotes, err := utils.Decrypt(*item.Notes, s.vaultKey)
		if err != nil {
			return nil, err
		}
		item.Notes = &decryptedNotes
	}

	return item, nil
}

func (s *ClientVaultService) Update(id uuid.UUID, clientID uuid.UUID, companyID uuid.UUID, input *domain.ClientVaultItem) error {
	// First fetch existing to verify and decrypt, ensuring ownership/existence
	existing, err := s.vaultRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return errors.New("item do cofre não encontrado")
	}

	if existing.ClientID != clientID {
		return errors.New("item não pertence ao cliente informado")
	}

	if input.Title == "" {
		return errors.New("o título da credencial é obrigatório")
	}
	if input.Password == "" {
		return errors.New("a senha é obrigatória")
	}

	existing.Title = input.Title

	// Re-encrypt fields

	encryptedPassword, err := utils.Encrypt(input.Password, s.vaultKey)
	if err != nil {
		return err
	}
	existing.Password = encryptedPassword

	if input.Notes != nil && *input.Notes != "" {
		encryptedNotes, err := utils.Encrypt(*input.Notes, s.vaultKey)
		if err != nil {
			return err
		}
		existing.Notes = &encryptedNotes
	} else {
		existing.Notes = nil
	}

	return s.vaultRepo.Update(existing)
}

func (s *ClientVaultService) Delete(id uuid.UUID, clientID uuid.UUID, companyID uuid.UUID) error {
	item, err := s.vaultRepo.FindByIDAndCompany(id, companyID)
	if err != nil {
		return errors.New("item do cofre não encontrado")
	}

	if item.ClientID != clientID {
		return errors.New("item não pertence ao cliente informado")
	}

	return s.vaultRepo.Delete(item)
}
