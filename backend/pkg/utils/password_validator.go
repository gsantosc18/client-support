package utils

import (
	"errors"
	"regexp"
	"strings"
	"unicode"
)

func ValidatePassword(password, fullName, email, phone string) error {
	if len(password) < 8 {
		return errors.New("a senha deve ter pelo menos 8 caracteres")
	}

	hasNumber := false
	hasSpecial := false
	hasUpper := false
	hasLower := false

	for _, char := range password {
		switch {
		case unicode.IsNumber(char):
			hasNumber = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		}
	}

	if !hasNumber {
		return errors.New("a senha deve ter pelo menos 1 número")
	}
	if !hasSpecial {
		return errors.New("a senha deve ter pelo menos 1 caractere especial")
	}
	if !hasUpper {
		return errors.New("a senha deve ter pelo menos 1 letra maiúscula")
	}
	if !hasLower {
		return errors.New("a senha deve ter pelo menos 1 letra minúscula")
	}

	if hasSequence3(password, true) {
		return errors.New("a senha não deve conter sequências de 3 ou mais letras")
	}

	if hasSequence3(password, false) {
		return errors.New("a senha não deve conter sequências de 3 ou mais números")
	}

	passwordLower := strings.ToLower(password)
	if strings.Contains(passwordLower, strings.ToLower(fullName)) {
		return errors.New("a senha não deve ser igual ao nome completo")
	}
	if strings.Contains(passwordLower, strings.ToLower(email)) {
		return errors.New("a senha não deve ser igual ao e-mail")
	}
	if phone != "" {
		cleanPhone := regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
		if cleanPhone != "" && strings.Contains(password, cleanPhone) {
			return errors.New("a senha não deve ser igual ao telefone")
		}
	}

	return nil
}

func hasSequence3(s string, letters bool) bool {
	sLower := strings.ToLower(s)
	for i := 0; i <= len(sLower)-3; i++ {
		c1, c2, c3 := rune(sLower[i]), rune(sLower[i+1]), rune(sLower[i+2])
		
		isCorrectType := false
		if letters {
			isCorrectType = unicode.IsLetter(c1) && unicode.IsLetter(c2) && unicode.IsLetter(c3)
		} else {
			isCorrectType = unicode.IsNumber(c1) && unicode.IsNumber(c2) && unicode.IsNumber(c3)
		}

		if !isCorrectType {
			continue
		}

		// Ascending sequence
		if c2 == c1+1 && c3 == c2+1 {
			return true
		}
		// Descending sequence
		if c2 == c1-1 && c3 == c2-1 {
			return true
		}
	}
	return false
}
