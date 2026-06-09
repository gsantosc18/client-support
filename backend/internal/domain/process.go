package domain

import (
	"time"

	"github.com/google/uuid"
)

type ProcessStatus string

const (
	ProcessStatusPending              ProcessStatus = "PENDING"
	ProcessStatusInProgress           ProcessStatus = "IN_PROGRESS"
	ProcessStatusAwaitingDocumentation ProcessStatus = "AWAITING_DOCUMENTATION"
	ProcessStatusInAnalysis           ProcessStatus = "IN_ANALYSIS"
	ProcessStatusCompleted            ProcessStatus = "COMPLETED"
	ProcessStatusCancelled            ProcessStatus = "CANCELLED"
)

type Process struct {
	ID              uuid.UUID     `json:"id" gorm:"type:char(36);primary_key;default:(uuid())"`
	CompanyID       uuid.UUID     `json:"company_id" gorm:"type:char(36);not null"`
	Company         Company       `json:"company" gorm:"foreignKey:CompanyID"`
	UserID          uuid.UUID     `json:"user_id" gorm:"type:char(36);not null"`
	User            User          `json:"user" gorm:"foreignKey:UserID"`
	EstablishmentID uuid.UUID     `json:"establishment_id" gorm:"type:char(36);not null"`
	Establishment   Establishment `json:"establishment" gorm:"foreignKey:EstablishmentID"`
	Protocol        *string       `json:"protocol" gorm:"default:null"`
	Observation     *string       `json:"observation" gorm:"default:null"`
	Status          ProcessStatus `json:"status" gorm:"not null;default:'PENDING'"`
	Clients         []Client      `json:"clients" gorm:"many2many:client_processes;"`
	CreatedAt       time.Time     `json:"created_at"`
	UpdatedAt       time.Time     `json:"updated_at"`
}

type ProcessRepository interface {
	Create(process *Process) error
	FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*Process, error)
	FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*Process, int, error)
	Update(process *Process) error
	Delete(id uuid.UUID, companyID uuid.UUID) error
}

type DeletedProcess struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key;default:(uuid())"`
	Data      []byte    `json:"data" gorm:"type:json;not null"`
	DeletedAt time.Time `json:"deleted_at" gorm:"type:timestamp;default:CURRENT_TIMESTAMP"`
}

