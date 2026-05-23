package service

import (
	"errors"
	"testing"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// --- Mocks para os Repositórios de Clientes e Processos ---

type MockClientRepository struct {
	mock.Mock
}

func (m *MockClientRepository) Create(client *domain.Client) error {
	args := m.Called(client)
	return args.Error(0)
}

func (m *MockClientRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Client, error) {
	args := m.Called(id, companyID)
	var client *domain.Client
	if args.Get(0) != nil {
		client = args.Get(0).(*domain.Client)
	}
	return client, args.Error(1)
}

func (m *MockClientRepository) FindAll(companyID uuid.UUID, search string, status string, page int, limit int) ([]*domain.Client, int, error) {
	args := m.Called(companyID, search, status, page, limit)
	var clients []*domain.Client
	if args.Get(0) != nil {
		clients = args.Get(0).([]*domain.Client)
	}
	return clients, args.Int(1), args.Error(2)
}

func (m *MockClientRepository) Update(client *domain.Client) error {
	args := m.Called(client)
	return args.Error(0)
}

func (m *MockClientRepository) Delete(client *domain.Client) error {
	args := m.Called(client)
	return args.Error(0)
}

func (m *MockClientRepository) ExistsByFieldAndCompany(field string, value string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	args := m.Called(field, value, companyID, excludeID)
	return args.Bool(0), args.Error(1)
}

type MockProcessRepository struct {
	mock.Mock
}

func (m *MockProcessRepository) Create(process *domain.Process) error {
	args := m.Called(process)
	return args.Error(0)
}

func (m *MockProcessRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	args := m.Called(id, companyID)
	var process *domain.Process
	if args.Get(0) != nil {
		process = args.Get(0).(*domain.Process)
	}
	return process, args.Error(1)
}

func (m *MockProcessRepository) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*domain.Process, int, error) {
	args := m.Called(companyID, clientID, userID, status, protocol, page, limit)
	var processes []*domain.Process
	if args.Get(0) != nil {
		processes = args.Get(0).([]*domain.Process)
	}
	return processes, args.Int(1), args.Error(2)
}

func (m *MockProcessRepository) Update(process *domain.Process) error {
	args := m.Called(process)
	return args.Error(0)
}

func (m *MockProcessRepository) Delete(id uuid.UUID, companyID uuid.UUID) error {
	args := m.Called(id, companyID)
	return args.Error(0)
}

// --- Testes de Unidade de ClientService ---

func TestClientService_Create(t *testing.T) {
	companyID := uuid.New()

	t.Run("Empresa inexistente", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(nil, errors.New("not found"))

		svc := NewClientService(nil, mockCompany, nil)
		err := svc.Create(&domain.Client{CompanyID: companyID})
		assert.EqualError(t, err, "empresa inválida ou não encontrada")
	})

	t.Run("Empresa inativa", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: "INACTIVE"}, nil)

		svc := NewClientService(nil, mockCompany, nil)
		err := svc.Create(&domain.Client{CompanyID: companyID})
		assert.EqualError(t, err, "a empresa informada está inativa ou suspensa")
	})

	t.Run("Nome completo vazio", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewClientService(nil, mockCompany, nil)
		err := svc.Create(&domain.Client{CompanyID: companyID, FullName: ""})
		assert.EqualError(t, err, "o nome completo do cliente é obrigatório")
	})

	t.Run("Sucesso", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockClient := new(MockClientRepository)
		mockClient.On("Create", mock.Anything).Return(nil)

		svc := NewClientService(mockClient, mockCompany, nil)
		err := svc.Create(&domain.Client{CompanyID: companyID, FullName: "John Doe"})
		assert.NoError(t, err)
		mockClient.AssertCalled(t, "Create", mock.Anything)
	})
}

func TestClientService_Delete(t *testing.T) {
	companyID := uuid.New()
	clientID := uuid.New()

	t.Run("Cliente nao encontrado", func(t *testing.T) {
		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(nil, errors.New("not found"))

		svc := NewClientService(mockClient, nil, nil)
		err := svc.Delete(clientID, companyID)
		assert.EqualError(t, err, "cliente não encontrado ou não pertence a esta empresa")
	})

	t.Run("Bloqueado por processos vinculados", func(t *testing.T) {
		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{ID: clientID, CompanyID: companyID, FullName: "John"}, nil)

		mockProcess := new(MockProcessRepository)
		// Simular que o cliente possui 1 processo associado
		mockProcess.On("FindAll", companyID, &clientID, (*uuid.UUID)(nil), "", "", 1, 1).Return([]*domain.Process{{ID: uuid.New()}}, 1, nil)

		svc := NewClientService(mockClient, nil, mockProcess)
		err := svc.Delete(clientID, companyID)
		assert.EqualError(t, err, "O cliente está vinculado a um processo e não pode ser removido.")
	})

	t.Run("Sucesso na exclusão física", func(t *testing.T) {
		client := &domain.Client{ID: clientID, CompanyID: companyID, FullName: "John", Status: domain.ClientStatusActive}
		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(client, nil)
		mockClient.On("Delete", client).Return(nil)

		mockProcess := new(MockProcessRepository)
		// Simular que o cliente não tem processos associados
		mockProcess.On("FindAll", companyID, &clientID, (*uuid.UUID)(nil), "", "", 1, 1).Return([]*domain.Process{}, 0, nil)

		svc := NewClientService(mockClient, nil, mockProcess)
		err := svc.Delete(clientID, companyID)
		assert.NoError(t, err)
		mockClient.AssertCalled(t, "Delete", client)
	})
}
