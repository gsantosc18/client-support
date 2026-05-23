package service

import (
	"testing"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

type MockEstablishmentRepository struct {
	mock.Mock
}

func (m *MockEstablishmentRepository) Create(est *domain.Establishment) error {
	args := m.Called(est)
	return args.Error(0)
}

func (m *MockEstablishmentRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Establishment, error) {
	args := m.Called(id, companyID)
	var est *domain.Establishment
	if args.Get(0) != nil {
		est = args.Get(0).(*domain.Establishment)
	}
	return est, args.Error(1)
}

func (m *MockEstablishmentRepository) FindAll(companyID uuid.UUID, search string, page int, limit int) ([]*domain.Establishment, int, error) {
	args := m.Called(companyID, search, page, limit)
	var ests []*domain.Establishment
	if args.Get(0) != nil {
		ests = args.Get(0).([]*domain.Establishment)
	}
	return ests, args.Int(1), args.Error(2)
}

func (m *MockEstablishmentRepository) Update(est *domain.Establishment) error {
	args := m.Called(est)
	return args.Error(0)
}

func (m *MockEstablishmentRepository) ExistsByNameAndCompany(name string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error) {
	args := m.Called(name, companyID, excludeID)
	return args.Bool(0), args.Error(1)
}

func TestEstablishmentService_Create(t *testing.T) {
	companyID := uuid.New()

	t.Run("Empresa inativa", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: "INACTIVE"}, nil)

		svc := NewEstablishmentService(nil, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS"})
		assert.EqualError(t, err, "a empresa informada está inativa ou suspensa")
	})

	t.Run("Nome curto", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewEstablishmentService(nil, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CR"})
		assert.EqualError(t, err, "o nome do estabelecimento deve ter pelo menos 3 caracteres")
	})

	t.Run("Endereco curto", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewEstablishmentService(nil, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS Centro", Address: "Rua"})
		assert.EqualError(t, err, "o endereço do estabelecimento deve ter pelo menos 5 caracteres")
	})

	t.Run("Cidade curta", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewEstablishmentService(nil, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS Centro", Address: "Rua Grande, 12", City: "S"})
		assert.EqualError(t, err, "a cidade do estabelecimento deve ter pelo menos 2 caracteres")
	})

	t.Run("Estado invalido", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		svc := NewEstablishmentService(nil, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS Centro", Address: "Rua Grande, 12", City: "Sao Paulo", State: "SPP"})
		assert.EqualError(t, err, "o estado deve ser composto por exatamente 2 caracteres (UF)")
	})

	t.Run("Duplicado", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockEstRepo := new(MockEstablishmentRepository)
		mockEstRepo.On("ExistsByNameAndCompany", "CRAS Centro", companyID, (*uuid.UUID)(nil)).Return(true, nil)

		svc := NewEstablishmentService(mockEstRepo, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS Centro", Address: "Rua Grande, 12", City: "Sao Paulo", State: "SP"})
		assert.EqualError(t, err, "já existe um estabelecimento cadastrado com este nome nesta empresa")
	})

	t.Run("Sucesso", func(t *testing.T) {
		mockCompany := new(MockCompanyRepository)
		mockCompany.On("FindByID", companyID).Return(&domain.Company{Status: domain.CompanyStatusActive}, nil)

		mockEstRepo := new(MockEstablishmentRepository)
		mockEstRepo.On("ExistsByNameAndCompany", "CRAS Centro", companyID, (*uuid.UUID)(nil)).Return(false, nil)
		mockEstRepo.On("Create", mock.Anything).Return(nil)

		svc := NewEstablishmentService(mockEstRepo, mockCompany)
		err := svc.Create(&domain.Establishment{CompanyID: companyID, Name: "CRAS Centro", Address: "Rua Grande, 12", City: "Sao Paulo", State: "SP"})
		assert.NoError(t, err)
		mockEstRepo.AssertCalled(t, "Create", mock.Anything)
	})
}
