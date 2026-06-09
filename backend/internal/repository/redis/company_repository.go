package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	redisclient "github.com/redis/go-redis/v9"
)

type CompanyRepository struct {
	dbRepo domain.CompanyRepository
	client *redisclient.Client
	ttl    time.Duration
}

func NewCompanyRepository(dbRepo domain.CompanyRepository, client *redisclient.Client, ttl time.Duration) *CompanyRepository {
	return &CompanyRepository{
		dbRepo: dbRepo,
		client: client,
		ttl:    ttl,
	}
}

func (r *CompanyRepository) FindByID(id uuid.UUID) (*domain.Company, error) {
	ctx := context.Background()
	key := fmt.Sprintf("company:%s", id.String())

	// Tenta recuperar do cache do Redis
	val, err := r.client.Get(ctx, key).Result()
	if err == nil {
		var company domain.Company
		if err := json.Unmarshal([]byte(val), &company); err == nil {
			return &company, nil
		}
	}

	// Cache miss ou falha no parse -> Consulta banco de dados
	company, err := r.dbRepo.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Atualiza o cache do Redis de forma assíncrona/silenciosa
	if data, err := json.Marshal(company); err == nil {
		_ = r.client.Set(ctx, key, data, r.ttl).Err()
	}

	return company, nil
}
