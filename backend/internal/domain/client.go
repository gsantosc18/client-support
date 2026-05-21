package domain

import (
	"time"

	"github.com/google/uuid"
)

type ClientStatus string

const (
	ClientStatusActive    ClientStatus = "ACTIVE"
	ClientStatusInactive  ClientStatus = "INACTIVE"
	ClientStatusSuspended ClientStatus = "SUSPENDED"
)

type Client struct {
	ID        uuid.UUID    `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	CompanyID uuid.UUID    `json:"company_id" gorm:"type:uuid;not null"`
	Company   Company      `json:"company" gorm:"foreignKey:CompanyID"`
	FullName  string       `json:"full_name" gorm:"not null"`
	Email     *string      `json:"email" gorm:"default:null"`
	Phone     *string      `json:"phone" gorm:"default:null"`
	BirthDate *time.Time   `json:"birth_date" gorm:"default:null"`
	CPF       *string      `json:"cpf" gorm:"default:null"`
	RG        *string      `json:"rg" gorm:"default:null"`
	CNH       *string      `json:"cnh" gorm:"default:null"`
	Status    ClientStatus `json:"status" gorm:"not null;default:'ACTIVE'"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
}

type DeletedClient struct {
	ID        int64     `json:"id" gorm:"primary_key;autoIncrement"`
	Data      []byte    `json:"data" gorm:"type:jsonb;not null"`
	DeletedAt time.Time `json:"deleted_at" gorm:"type:timestamp with time zone;default:CURRENT_TIMESTAMP"`
}

type ClientRepository interface {
	Create(client *Client) error
	FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*Client, error)
	FindAll(companyID uuid.UUID, search string, status string, page int, limit int) ([]*Client, int, error)
	Update(client *Client) error
	Delete(client *Client) error
	ExistsByFieldAndCompany(field string, value string, companyID uuid.UUID, excludeID *uuid.UUID) (bool, error)
}
