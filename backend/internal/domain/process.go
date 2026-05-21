package domain

import (
	"time"

	"github.com/google/uuid"
)

type ProcessStatus string

const (
	ProcessStatusStarted    ProcessStatus = "STARTED"
	ProcessStatusPending    ProcessStatus = "PENDING"
	ProcessStatusInProgress ProcessStatus = "IN_PROGRESS"
	ProcessStatusCompleted  ProcessStatus = "COMPLETED"
	ProcessStatusCancelled  ProcessStatus = "CANCELLED"
)

type Process struct {
	ID         uuid.UUID     `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CompanyID  uuid.UUID     `json:"company_id" gorm:"type:uuid;not null"`
	Company    Company       `json:"company" gorm:"foreignKey:CompanyID"`
	ClientID   uuid.UUID     `json:"client_id" gorm:"type:uuid;not null"`
	Client     Client        `json:"client" gorm:"foreignKey:ClientID"`
	UserID     uuid.UUID     `json:"user_id" gorm:"type:uuid;not null"`
	User       User          `json:"user" gorm:"foreignKey:UserID"`
	ExternalID *string       `json:"external_id" gorm:"default:null"`
	Status     ProcessStatus `json:"status" gorm:"not null;default:'STARTED'"`
	CreatedAt  time.Time     `json:"created_at"`
	UpdatedAt  time.Time     `json:"updated_at"`
}

type ProcessRepository interface {
	Create(process *Process) error
	FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*Process, error)
	FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, externalID string, page int, limit int) ([]*Process, int, error)
	Update(process *Process) error
	ExistsExternalIDInCompany(externalID string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error)
}
