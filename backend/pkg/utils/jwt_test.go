package utils

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestJWTTokenFlow(t *testing.T) {
	userID := uuid.New()
	companyID := uuid.New()

	t.Run("Generate token pair without keep logged in", func(t *testing.T) {
		pair, err := GenerateTokenPair(userID, companyID, false)
		assert.NoError(t, err)
		assert.NotEmpty(t, pair.AccessToken)
		assert.NotEmpty(t, pair.RefreshToken)

		claims, err := ValidateToken(pair.AccessToken)
		assert.NoError(t, err)
		assert.Equal(t, userID, claims.UserID)
		assert.Equal(t, companyID, claims.CompanyID)
		assert.Equal(t, "access", claims.TokenType)

		refreshClaims, err := ValidateToken(pair.RefreshToken)
		assert.NoError(t, err)
		assert.Equal(t, userID, refreshClaims.UserID)
		assert.Equal(t, companyID, refreshClaims.CompanyID)
		assert.Equal(t, "refresh", refreshClaims.TokenType)
		
		// Check that the expiration is roughly 30 minutes
		expiresIn := time.Until(refreshClaims.ExpiresAt.Time)
		assert.True(t, expiresIn > 29*time.Minute && expiresIn <= 30*time.Minute)
	})

	t.Run("Generate token pair with keep logged in", func(t *testing.T) {
		pair, err := GenerateTokenPair(userID, companyID, true)
		assert.NoError(t, err)
		assert.NotEmpty(t, pair.AccessToken)
		assert.NotEmpty(t, pair.RefreshToken)

		refreshClaims, err := ValidateToken(pair.RefreshToken)
		assert.NoError(t, err)
		assert.Equal(t, userID, refreshClaims.UserID)
		assert.Equal(t, companyID, refreshClaims.CompanyID)
		assert.Equal(t, "refresh", refreshClaims.TokenType)

		// Check that the expiration is roughly 7 days
		expiresIn := time.Until(refreshClaims.ExpiresAt.Time)
		assert.True(t, expiresIn > 6*24*time.Hour && expiresIn <= 7*24*time.Hour)
	})

	t.Run("Invalid token validation", func(t *testing.T) {
		claims, err := ValidateToken("invalid.token.string")
		assert.Error(t, err)
		assert.Nil(t, claims)
	})
}
