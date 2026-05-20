package postgres

import (
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	gormpostgres "gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestCompanyRepository(t *testing.T) {
	dsn := "host=localhost user=root password=rootpassword dbname=client_support port=5432 sslmode=disable TimeZone=UTC"
	db, err := gorm.Open(gormpostgres.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skip("PostgreSQL not running at localhost:5432, skipping company repo integration test")
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
