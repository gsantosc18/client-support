package service

import (
	"fmt"
	"testing"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

type mockCompanyRepo struct {
	company *domain.Company
	err     error
}

func (m *mockCompanyRepo) FindByID(id uuid.UUID) (*domain.Company, error) {
	if m.err != nil {
		return nil, m.err
	}
	return m.company, nil
}

func TestCompanyService_FindByID(t *testing.T) {
	companyID := uuid.New()
	mockRepo := &mockCompanyRepo{
		company: &domain.Company{
			ID:     companyID,
			Name:   "Service Test Company",
			Status: domain.CompanyStatusActive,
		},
	}

	service := NewCompanyService(mockRepo)

	t.Run("Success", func(t *testing.T) {
		comp, err := service.FindByID(companyID)
		assert.NoError(t, err)
		assert.NotNil(t, comp)
		assert.Equal(t, companyID, comp.ID)
		assert.Equal(t, "Service Test Company", comp.Name)
	})

	t.Run("Error", func(t *testing.T) {
		mockRepoErr := &mockCompanyRepo{
			err: fmt.Errorf("db error"),
		}
		serviceErr := NewCompanyService(mockRepoErr)
		comp, err := serviceErr.FindByID(companyID)
		assert.Error(t, err)
		assert.Nil(t, comp)
	})
}
