package redis

import (
	"context"
	"fmt"
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	redisclient "github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

type mockDBCompanyRepository struct {
	CompanyMap map[uuid.UUID]*domain.Company
	Calls      int
}

func (m *mockDBCompanyRepository) FindByID(id uuid.UUID) (*domain.Company, error) {
	m.Calls++
	c, ok := m.CompanyMap[id]
	if !ok {
		return nil, fmt.Errorf("company not found")
	}
	return c, nil
}

func TestCompanyRepository(t *testing.T) {
	client := redisclient.NewClient(&redisclient.Options{
		Addr: "localhost:6379",
	})

	ctx := context.Background()
	// Test connection and skip if Redis is not available
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skip("Redis container not running on localhost:6379, skipping company repository cache integration test")
		return
	}
	defer client.Close()

	companyID := uuid.New()
	companyName := "Test Company Cached"
	testCompany := &domain.Company{
		ID:        companyID,
		Name:      companyName,
		Status:    domain.CompanyStatusActive,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	mockDB := &mockDBCompanyRepository{
		CompanyMap: map[uuid.UUID]*domain.Company{
			companyID: testCompany,
		},
	}

	ttl := 5 * time.Second
	repo := NewCompanyRepository(mockDB, client, ttl)

	// Clean up potential dirty state
	key := fmt.Sprintf("company:%s", companyID.String())
	client.Del(ctx, key)
	defer client.Del(ctx, key)

	t.Run("Cache Miss - Retrieves from DB and stores in Cache", func(t *testing.T) {
		mockDB.Calls = 0

		// First call should result in cache miss and query database
		comp, err := repo.FindByID(companyID)
		assert.NoError(t, err)
		assert.NotNil(t, comp)
		assert.Equal(t, companyID, comp.ID)
		assert.Equal(t, companyName, comp.Name)
		assert.Equal(t, 1, mockDB.Calls)

		// Wait slightly to let async routine (if any) or synchronous set complete
		time.Sleep(100 * time.Millisecond)

		// Confirm key was set in Redis
		val, err := client.Get(ctx, key).Result()
		assert.NoError(t, err)
		assert.NotEmpty(t, val)
	})

	t.Run("Cache Hit - Retrieves from Redis directly", func(t *testing.T) {
		mockDB.Calls = 0

		// Second call should fetch directly from Redis, Calls to DB should remain 0
		comp, err := repo.FindByID(companyID)
		assert.NoError(t, err)
		assert.NotNil(t, comp)
		assert.Equal(t, companyID, comp.ID)
		assert.Equal(t, companyName, comp.Name)
		assert.Equal(t, 0, mockDB.Calls)
	})

	t.Run("DB Error - Return original error", func(t *testing.T) {
		nonExistingID := uuid.New()
		comp, err := repo.FindByID(nonExistingID)
		assert.Error(t, err)
		assert.Nil(t, comp)
	})
}
