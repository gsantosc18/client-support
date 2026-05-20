package service

import (
	"fmt"
	"log"
)

type EmailService interface {
	SendPasswordRecoveryEmail(to string, companyName string, recoveryLink string) error
}

type SMTPEmailService struct {
	// Add SMTP configurations here like host, port, user, password
}

func NewSMTPEmailService() *SMTPEmailService {
	return &SMTPEmailService{}
}

func (s *SMTPEmailService) SendPasswordRecoveryEmail(to string, companyName string, recoveryLink string) error {
	// In a real application, you would use net/smtp or a library like gomail to send the email
	subject := fmt.Sprintf("Recuperação de senha - %s", companyName)
	body := fmt.Sprintf("Olá,\n\nVocê solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:\n%s\n\nEste link é válido por 15 minutos.\n\nAtenciosamente,\n%s", recoveryLink, companyName)

	log.Printf("Simulating sending email to %s\nSubject: %s\nBody: %s\n", to, subject, body)
	
	return nil
}
