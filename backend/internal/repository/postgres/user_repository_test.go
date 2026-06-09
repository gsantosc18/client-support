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

func TestUserRepository(t *testing.T) {
	dsn := "root:rootpassword@tcp(localhost:3306)/client_support?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(gormmysql.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Skip("MariaDB not running at localhost:3306, skipping user repo integration test")
		return
	}

	// Run within a transaction and rollback at the end
	tx := db.Begin()
	defer tx.Rollback()

	// Need a valid company in the DB first for foreign key constraints
	companyID := uuid.New()
	company := &domain.Company{
		ID:     companyID,
		Name:   "Integration Test Company for User Repo",
		Status: domain.CompanyStatusActive,
	}
	err = tx.Create(company).Error
	assert.NoError(t, err)

	repo := NewUserRepository(tx)

	userID := uuid.New()
	phoneVal := "123456789"
	user := &domain.User{
		ID:        userID,
		CompanyID: companyID,
		FirstName: "John",
		LastName:  "Doe",
		Email:     "john.doe@testrepo.com",
		Phone:     &phoneVal,
		BirthDate: time.Now().AddDate(-30, 0, 0),
		Password:  "hashed-password",
		Status:    domain.UserStatusActive,
	}

	t.Run("Create User", func(t *testing.T) {
		err = repo.Create(user)
		assert.NoError(t, err)
	})

	t.Run("FindByID - Existing", func(t *testing.T) {
		found, err := repo.FindByID(userID)
		assert.NoError(t, err)
		assert.NotNil(t, found)
		assert.Equal(t, userID, found.ID)
		assert.Equal(t, "john.doe@testrepo.com", found.Email)
	})

	t.Run("FindByID - Non Existing", func(t *testing.T) {
		found, err := repo.FindByID(uuid.New())
		assert.Error(t, err)
		assert.Nil(t, found)
	})

	t.Run("FindByEmailAndCompany - Existing", func(t *testing.T) {
		found, err := repo.FindByEmailAndCompany("john.doe@testrepo.com", companyID)
		assert.NoError(t, err)
		assert.NotNil(t, found)
		assert.Equal(t, userID, found.ID)
	})

	t.Run("FindByEmailAndCompany - Non Existing", func(t *testing.T) {
		found, err := repo.FindByEmailAndCompany("nonexisting@testrepo.com", companyID)
		assert.Error(t, err)
		assert.Nil(t, found)
	})

	t.Run("Update User", func(t *testing.T) {
		user.FirstName = "Johnny Updated"
		err = repo.Update(user)
		assert.NoError(t, err)

		found, err := repo.FindByID(userID)
		assert.NoError(t, err)
		assert.Equal(t, "Johnny Updated", found.FirstName)
	})

	t.Run("Save, Find, and Mark Recovery Token", func(t *testing.T) {
		tokenID := uuid.New()
		recoveryToken := &domain.PasswordRecoveryToken{
			ID:        tokenID,
			UserID:    userID,
			Token:     "some-secret-recovery-token-xyz",
			ExpiresAt: time.Now().Add(15 * time.Minute),
			Used:      false,
		}

		// Save Recovery Token
		err = repo.SaveRecoveryToken(recoveryToken)
		assert.NoError(t, err)

		// Find Recovery Token
		foundToken, err := repo.FindRecoveryToken("some-secret-recovery-token-xyz")
		assert.NoError(t, err)
		assert.NotNil(t, foundToken)
		assert.Equal(t, tokenID, foundToken.ID)
		assert.False(t, foundToken.Used)

		// Non-existent token find
		missingToken, err := repo.FindRecoveryToken("non-existent-token")
		assert.Error(t, err)
		assert.Nil(t, missingToken)

		// Mark Used
		err = repo.MarkRecoveryTokenUsed(tokenID)
		assert.NoError(t, err)

		foundTokenAfter, err := repo.FindRecoveryToken("some-secret-recovery-token-xyz")
		assert.NoError(t, err)
		assert.True(t, foundTokenAfter.Used)
	})
}
