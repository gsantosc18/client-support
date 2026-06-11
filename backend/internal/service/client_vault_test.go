package service

import (
	"errors"
	"testing"

	"github.com/client-support/backend/internal/domain"
	"github.com/client-support/backend/pkg/utils"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockClientVaultRepository struct {
	mock.Mock
}

func (m *MockClientVaultRepository) Create(item *domain.ClientVaultItem) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockClientVaultRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.ClientVaultItem, error) {
	args := m.Called(id, companyID)
	var item *domain.ClientVaultItem
	if args.Get(0) != nil {
		item = args.Get(0).(*domain.ClientVaultItem)
	}
	return item, args.Error(1)
}

func (m *MockClientVaultRepository) FindAllByClient(clientID uuid.UUID, companyID uuid.UUID) ([]*domain.ClientVaultItem, error) {
	args := m.Called(clientID, companyID)
	var items []*domain.ClientVaultItem
	if args.Get(0) != nil {
		items = args.Get(0).([]*domain.ClientVaultItem)
	}
	return items, args.Error(1)
}

func (m *MockClientVaultRepository) Update(item *domain.ClientVaultItem) error {
	args := m.Called(item)
	return args.Error(0)
}

func (m *MockClientVaultRepository) Delete(item *domain.ClientVaultItem) error {
	args := m.Called(item)
	return args.Error(0)
}

func TestClientVaultService(t *testing.T) {
	vaultKey := "vault-test-secret-key-32bytes-len"
	companyID := uuid.New()
	clientID := uuid.New()

	t.Run("Create Vault Item - Client Not Found", func(t *testing.T) {
		mockClientRepo := new(MockClientRepository)
		mockClientRepo.On("FindByIDAndCompany", clientID, companyID).Return(nil, errors.New("not found"))

		svc := NewClientVaultService(nil, mockClientRepo, vaultKey)
		err := svc.Create(&domain.ClientVaultItem{
			ClientID:  clientID,
			CompanyID: companyID,
			Title:     "Portal",
			Password:  "pass",
		})
		assert.EqualError(t, err, "cliente não encontrado ou não pertence a esta empresa")
	})

	t.Run("Create Vault Item - Success", func(t *testing.T) {
		mockClientRepo := new(MockClientRepository)
		mockClientRepo.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{ID: clientID}, nil)

		mockVaultRepo := new(MockClientVaultRepository)
		mockVaultRepo.On("Create", mock.Anything).Return(nil)

		svc := NewClientVaultService(mockVaultRepo, mockClientRepo, vaultKey)
		
		notes := "note"
		item := &domain.ClientVaultItem{
			ClientID:  clientID,
			CompanyID: companyID,
			UserID:    uuid.New(),
			Title:     "Portal",
			Password:  "password123",
			Notes:     &notes,
		}

		err := svc.Create(item)
		assert.NoError(t, err)
		assert.NotEmpty(t, item.Password)
		assert.NotEqual(t, "password123", item.Password)
	})

	t.Run("FindAllByClient - Success and Masking", func(t *testing.T) {
		mockClientRepo := new(MockClientRepository)
		mockClientRepo.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{ID: clientID}, nil)

		encPassword, _ := utils.Encrypt("pass123", vaultKey)
		
		item := &domain.ClientVaultItem{
			ClientID:  clientID,
			CompanyID: companyID,
			UserID:    uuid.New(),
			Title:     "Portal 1",
			Password:  encPassword,
		}

		mockVaultRepo := new(MockClientVaultRepository)
		mockVaultRepo.On("FindAllByClient", clientID, companyID).Return([]*domain.ClientVaultItem{item}, nil)

		svc := NewClientVaultService(mockVaultRepo, mockClientRepo, vaultKey)
		items, err := svc.FindAllByClient(clientID, companyID)
		
		assert.NoError(t, err)
		assert.Len(t, items, 1)
		assert.Equal(t, "Portal 1", items[0].Title)
		assert.Empty(t, items[0].Password)             // Hidden/Cleared password
		assert.Nil(t, items[0].Notes)                  // Hidden notes
	})

	t.Run("FindByIDAndCompany - Decrypts fully", func(t *testing.T) {
		mockClientRepo := new(MockClientRepository)
		mockClientRepo.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{ID: clientID}, nil)

		notesVal := "secret-note"
		encPassword, _ := utils.Encrypt("pass123", vaultKey)
		encNotes, _ := utils.Encrypt(notesVal, vaultKey)

		item := &domain.ClientVaultItem{
			ID:        uuid.New(),
			ClientID:  clientID,
			CompanyID: companyID,
			UserID:    uuid.New(),
			Title:     "Portal 1",
			Password:  encPassword,
			Notes:     &encNotes,
		}

		mockVaultRepo := new(MockClientVaultRepository)
		mockVaultRepo.On("FindByIDAndCompany", item.ID, companyID).Return(item, nil)

		svc := NewClientVaultService(mockVaultRepo, mockClientRepo, vaultKey)
		decrypted, err := svc.FindByIDAndCompany(item.ID, clientID, companyID)

		assert.NoError(t, err)
		assert.Equal(t, "pass123", decrypted.Password)
		assert.Equal(t, "secret-note", *decrypted.Notes)
	})
}
