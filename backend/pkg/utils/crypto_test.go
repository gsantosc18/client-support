package utils

import (
	"testing"
)

func TestEncryptDecrypt(t *testing.T) {
	secret := "super-secret-key"
	plainText := "hello, world!"

	encrypted, err := Encrypt(plainText, secret)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}

	if encrypted == "" {
		t.Fatal("Encrypted string is empty")
	}

	if encrypted == plainText {
		t.Fatal("Encrypted text is equal to plain text")
	}

	decrypted, err := Decrypt(encrypted, secret)
	if err != nil {
		t.Fatalf("Failed to decrypt: %v", err)
	}

	if decrypted != plainText {
		t.Fatalf("Expected decrypted text to be '%s', got '%s'", plainText, decrypted)
	}
}

func TestEncryptDecryptEmpty(t *testing.T) {
	secret := "another-secret"
	
	encrypted, err := Encrypt("", secret)
	if err != nil {
		t.Fatalf("Failed to encrypt empty string: %v", err)
	}
	if encrypted != "" {
		t.Fatalf("Expected empty ciphertext, got '%s'", encrypted)
	}

	decrypted, err := Decrypt("", secret)
	if err != nil {
		t.Fatalf("Failed to decrypt empty string: %v", err)
	}
	if decrypted != "" {
		t.Fatalf("Expected empty plaintext, got '%s'", decrypted)
	}
}

func TestDecryptWithWrongSecret(t *testing.T) {
	secret1 := "secret-one"
	secret2 := "secret-two"
	plainText := "secret message"

	encrypted, err := Encrypt(plainText, secret1)
	if err != nil {
		t.Fatalf("Failed to encrypt: %v", err)
	}

	_, err = Decrypt(encrypted, secret2)
	if err == nil {
		t.Fatal("Expected decryption to fail with wrong secret, but it succeeded")
	}
}
