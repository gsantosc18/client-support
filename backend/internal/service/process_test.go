package service

import (
	"errors"
	"testing"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)


type MockProcessRepositoryExtended struct {
	mock.Mock
}

func (m *MockProcessRepositoryExtended) Create(process *domain.Process) error {
	args := m.Called(process)
	return args.Error(0)
}

func (m *MockProcessRepositoryExtended) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	args := m.Called(id, companyID)
	var process *domain.Process
	if args.Get(0) != nil {
		process = args.Get(0).(*domain.Process)
	}
	return process, args.Error(1)
}

func (m *MockProcessRepositoryExtended) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*domain.Process, int, error) {
	args := m.Called(companyID, clientID, userID, status, protocol, page, limit)
	var processes []*domain.Process
	if args.Get(0) != nil {
		processes = args.Get(0).([]*domain.Process)
	}
	return processes, args.Int(1), args.Error(2)
}

func (m *MockProcessRepositoryExtended) Update(process *domain.Process) error {
	args := m.Called(process)
	return args.Error(0)
}

func (m *MockProcessRepositoryExtended) Delete(id uuid.UUID, companyID uuid.UUID) error {
	args := m.Called(id, companyID)
	return args.Error(0)
}

func TestProcessService_Create(t *testing.T) {
	companyID := uuid.New()
	userID := uuid.New()
	estID := uuid.New()
	clientID := uuid.New()

	t.Run("Sem clientes", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewProcessService(nil, nil, nil, mockCompany, nil)
		err := svc.Create(&domain.Process{CompanyID: companyID}, []uuid.UUID{})
		assert.EqualError(t, err, "um processo deve ter pelo menos um cliente associado")
	})

	t.Run("Cliente inativo", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{Status: "INACTIVE"}, nil)

		svc := NewProcessService(nil, mockClient, nil, mockCompany, nil)
		err := svc.Create(&domain.Process{CompanyID: companyID}, []uuid.UUID{clientID})
		assert.EqualError(t, err, "não é possível abrir um processo para um cliente inativo ou suspenso")
	})

	t.Run("Estabelecimento invalido", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{Status: domain.ClientStatusActive}, nil)

		mockEst := new(MockEstablishmentRepository)
		mockEst.On("FindByIDAndCompany", estID, companyID).Return(nil, errors.New("not found"))

		svc := NewProcessService(nil, mockClient, nil, mockCompany, mockEst)
		err := svc.Create(&domain.Process{CompanyID: companyID, EstablishmentID: estID}, []uuid.UUID{clientID})
		assert.EqualError(t, err, "estabelecimento inválido ou não encontrado")
	})

	t.Run("Operador inativo", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{Status: domain.ClientStatusActive}, nil)

		mockEst := new(MockEstablishmentRepository)
		mockEst.On("FindByIDAndCompany", estID, companyID).Return(&domain.Establishment{ID: estID}, nil)

		mockUser := new(MockUserRepository)
		mockUser.On("FindByID", userID).Return(&domain.User{CompanyID: companyID, Status: "INACTIVE"}, nil)

		svc := NewProcessService(nil, mockClient, mockUser, mockCompany, mockEst)
		err := svc.Create(&domain.Process{CompanyID: companyID, EstablishmentID: estID, UserID: userID}, []uuid.UUID{clientID})
		assert.EqualError(t, err, "não é possível atribuir o processo a um operador inativo ou suspenso")
	})

	t.Run("Sucesso", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockClient := new(MockClientRepository)
		mockClient.On("FindByIDAndCompany", clientID, companyID).Return(&domain.Client{Status: domain.ClientStatusActive}, nil)

		mockEst := new(MockEstablishmentRepository)
		mockEst.On("FindByIDAndCompany", estID, companyID).Return(&domain.Establishment{ID: estID}, nil)

		mockUser := new(MockUserRepository)
		mockUser.On("FindByID", userID).Return(&domain.User{CompanyID: companyID, Status: domain.UserStatusActive}, nil)

		mockProcessRepo := new(MockProcessRepositoryExtended)
		mockProcessRepo.On("Create", mock.Anything).Return(nil)

		svc := NewProcessService(mockProcessRepo, mockClient, mockUser, mockCompany, mockEst)
		err := svc.Create(&domain.Process{CompanyID: companyID, EstablishmentID: estID, UserID: userID}, []uuid.UUID{clientID})
		assert.NoError(t, err)
		mockProcessRepo.AssertCalled(t, "Create", mock.Anything)
	})
}
