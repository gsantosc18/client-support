package redis

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type TokenBlacklist struct {
	client *redis.Client
}

func NewTokenBlacklist(client *redis.Client) *TokenBlacklist {
	return &TokenBlacklist{client: client}
}

// Add token to blacklist with an expiration time
func (b *TokenBlacklist) Add(ctx context.Context, token string, expiration time.Duration) error {
	return b.client.Set(ctx, token, "blacklisted", expiration).Err()
}

// Check if token is in blacklist
func (b *TokenBlacklist) IsBlacklisted(ctx context.Context, token string) (bool, error) {
	val, err := b.client.Get(ctx, token).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return val == "blacklisted", nil
}
