package redis

import (
	"context"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
)

func TestTokenBlacklist(t *testing.T) {
	client := redis.NewClient(&redis.Options{
		Addr: "localhost:6379",
	})

	ctx := context.Background()
	// Test connection and skip if Redis is not available
	if err := client.Ping(ctx).Err(); err != nil {
		t.Skip("Redis container not running on localhost:6379, skipping blacklist integration test")
		return
	}
	defer client.Close()

	blacklist := NewTokenBlacklist(client)
	token := "test-token-for-blacklist-" + time.Now().String()

	// 1. Initial State - Should not be blacklisted
	isBlacklisted, err := blacklist.IsBlacklisted(ctx, token)
	assert.NoError(t, err)
	assert.False(t, isBlacklisted)

	// 2. Blacklist Token
	err = blacklist.Add(ctx, token, 1*time.Minute)
	assert.NoError(t, err)

	// 3. Post-Blacklist State - Should be blacklisted
	isBlacklisted, err = blacklist.IsBlacklisted(ctx, token)
	assert.NoError(t, err)
	assert.True(t, isBlacklisted)

	// 4. Cleanup
	client.Del(ctx, token)
}
