package domain

import (
	"time"

	"github.com/google/uuid"
)

type ClientVaultItem struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key;default:(uuid())"`
	ClientID  uuid.UUID `json:"client_id" gorm:"type:char(36);not null"`
	Client    Client    `json:"-" gorm:"foreignKey:ClientID"`
	CompanyID uuid.UUID `json:"company_id" gorm:"type:char(36);not null"`
	Company   Company   `json:"-" gorm:"foreignKey:CompanyID"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`
	User      User      `json:"-" gorm:"foreignKey:UserID"`
	Title     string    `json:"title" gorm:"not null"`
	Password  string    `json:"password,omitempty" gorm:"not null"`      // Encriptado no DB
	Notes     *string   `json:"notes,omitempty" gorm:"default:null"`    // Encriptado no DB
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type ClientVaultRepository interface {
	Create(item *ClientVaultItem) error
	FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*ClientVaultItem, error)
	FindAllByClient(clientID uuid.UUID, companyID uuid.UUID) ([]*ClientVaultItem, error)
	Update(item *ClientVaultItem) error
	Delete(item *ClientVaultItem) error
}
