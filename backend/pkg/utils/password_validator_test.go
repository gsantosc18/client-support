package utils

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidatePassword(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		fullName  string
		email     string
		phone     string
		expectErr string
	}{
		{
			name:      "Too short",
			password:  "Short@1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha deve ter pelo menos 8 caracteres",
		},
		{
			name:      "Missing number",
			password:  "NoNumber@",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha deve ter pelo menos 1 número",
		},
		{
			name:      "Missing special char",
			password:  "NoSpecial1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha deve ter pelo menos 1 caractere especial",
		},
		{
			name:      "Missing uppercase letter",
			password:  "noupper@1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha deve ter pelo menos 1 letra maiúscula",
		},
		{
			name:      "Missing lowercase letter",
			password:  "NOLOWER@1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha deve ter pelo menos 1 letra minúscula",
		},
		{
			name:      "Has alphabetical sequence of 3 ascending",
			password:  "Abc@12345",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha não deve conter sequências de 3 ou mais letras",
		},
		{
			name:      "Has alphabetical sequence of 3 descending",
			password:  "Cba@12345",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha não deve conter sequências de 3 ou mais letras",
		},
		{
			name:      "Has numerical sequence of 3 ascending",
			password:  "Valid@123",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha não deve conter sequências de 3 ou mais números",
		},
		{
			name:      "Has numerical sequence of 3 descending",
			password:  "Valid@321",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha não deve conter sequências de 3 ou mais números",
		},
		{
			name:      "Equal to full name",
			password:  "John Doe@1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "a senha não deve ser igual ao nome completo",
		},
		{
			name:      "Equal to email",
			password:  "John@doe.com@1",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "951357246",
			expectErr: "a senha não deve ser igual ao e-mail",
		},
		{
			name:      "Equal to phone",
			password:  "951357246@Aa",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "951357246",
			expectErr: "a senha não deve ser igual ao telefone",
		},
		{
			name:      "Valid password",
			password:  "Valid@592",
			fullName:  "John Doe",
			email:     "john@doe.com",
			phone:     "123456789",
			expectErr: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := ValidatePassword(tt.password, tt.fullName, tt.email, tt.phone)
			if tt.expectErr != "" {
				assert.EqualError(t, err, tt.expectErr)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}
