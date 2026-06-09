package postgres

import (
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	gormmysql "gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func TestCompanyRepository(t *testing.T) {
	dsn := "root:rootpassword@tcp(localhost:3306)/client_support?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(gormmysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skip("MariaDB not running at localhost:3306, skipping company repo integration test")
		return
	}

	// Run within a transaction and rollback at the end
	tx := db.Begin()
	defer tx.Rollback()

	repo := NewCompanyRepository(tx)

	companyID := uuid.New()
	company := &domain.Company{
		ID:        companyID,
		Name:      "Integration Test Company",
		Status:    domain.CompanyStatusActive,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err = tx.Create(company).Error
	assert.NoError(t, err)

	t.Run("FindByID - Existing", func(t *testing.T) {
		found, err := repo.FindByID(companyID)
		assert.NoError(t, err)
		assert.NotNil(t, found)
		assert.Equal(t, companyID, found.ID)
		assert.Equal(t, "Integration Test Company", found.Name)
	})

	t.Run("FindByID - Non Existing", func(t *testing.T) {
		found, err := repo.FindByID(uuid.New())
		assert.Error(t, err)
		assert.Nil(t, found)
	})
}
