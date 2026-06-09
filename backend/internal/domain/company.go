package domain

import (
	"time"

	"github.com/google/uuid"
)

type CompanyStatus string

const (
	CompanyStatusActive   CompanyStatus = "ACTIVE"
	CompanyStatusInactive CompanyStatus = "INACTIVE"
)

type Company struct {
	ID        uuid.UUID     `json:"id" gorm:"type:char(36);primary_key;default:(uuid())"`
	Name      string        `json:"name" gorm:"not null"`
	Status    CompanyStatus `json:"status" gorm:"not null;default:'ACTIVE'"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

type CompanyRepository interface {
	FindByID(id uuid.UUID) (*Company, error)
}
