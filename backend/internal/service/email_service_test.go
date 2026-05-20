package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestSMTPEmailService(t *testing.T) {
	service := NewSMTPEmailService()
	assert.NotNil(t, service)

	err := service.SendPasswordRecoveryEmail("user@example.com", "Test Company", "http://localhost/reset?token=123")
	assert.NoError(t, err)
}
