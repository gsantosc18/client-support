package utils

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

var (
	jwtSecret               = []byte("my-secret-key-change-in-prod") // Should be from env
	accessTokenDuration     = 30 * time.Minute
	refreshTokenDuration    = 30 * time.Minute
	extendedRefreshDuration = 7 * 24 * time.Hour
)

type TokenPair struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type Claims struct {
	UserID         uuid.UUID `json:"user_id"`
	CompanyID      uuid.UUID `json:"company_id"`
	TokenType      string    `json:"token_type"`
	KeepMeLoggedIn bool      `json:"keep_me_logged_in,omitempty"`
	jwt.RegisteredClaims
}

func GenerateTokenPair(userID, companyID uuid.UUID, keepMeLoggedIn bool) (*TokenPair, error) {
	accessClaims := Claims{
		UserID:         userID,
		CompanyID:      companyID,
		TokenType:      "access",
		KeepMeLoggedIn: keepMeLoggedIn,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	refreshDuration := refreshTokenDuration
	if keepMeLoggedIn {
		refreshDuration = extendedRefreshDuration
	}

	refreshClaims := Claims{
		UserID:         userID,
		CompanyID:      companyID,
		TokenType:      "refresh",
		KeepMeLoggedIn: keepMeLoggedIn,
		RegisteredClaims: jwt.RegisteredClaims{
			ID:        uuid.New().String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(refreshDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString(jwtSecret)
	if err != nil {
		return nil, err
	}

	return &TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

func ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}
	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

func SetJWTSecret(secret string) {
	jwtSecret = []byte(secret)
}

func SetTokenDurations(access, refresh, extended time.Duration) {
	if access > 0 {
		accessTokenDuration = access
	}
	if refresh > 0 {
		refreshTokenDuration = refresh
	}
	if extended > 0 {
		extendedRefreshDuration = extended
	}
}
