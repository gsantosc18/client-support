package domain

import (
	"time"

	"github.com/google/uuid"
)

type UserStatus string

const (
	UserStatusActive   UserStatus = "ACTIVE"
	UserStatusInactive UserStatus = "INACTIVE"
)

type User struct {
	ID                   uuid.UUID  `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	FirstName            string     `json:"first_name" gorm:"not null"`
	LastName             string     `json:"last_name" gorm:"not null"`
	Email                string     `json:"email" gorm:"not null;uniqueIndex:idx_company_email"`
	Phone                *string    `json:"phone"`
	BirthDate            time.Time  `json:"birth_date" gorm:"not null"`
	Password             string     `json:"-" gorm:"not null"`
	Status               UserStatus `json:"status" gorm:"not null;default:'ACTIVE'"`
	CompanyID            uuid.UUID  `json:"company_id" gorm:"type:uuid;not null;uniqueIndex:idx_company_email"`
	Company              Company    `json:"company" gorm:"foreignKey:CompanyID"`
	FailedLoginAttempts  int        `json:"failed_login_attempts" gorm:"default:0"`
	LockedUntil          *time.Time `json:"locked_until"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

type PasswordRecoveryToken struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	UserID    uuid.UUID `gorm:"type:uuid;not null"`
	Token     string    `gorm:"not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null"`
	Used      bool      `gorm:"default:false"`
	CreatedAt time.Time
}

type UserRepository interface {
	Create(user *User) error
	FindByEmailAndCompany(email string, companyID uuid.UUID) (*User, error)
	FindByID(id uuid.UUID) (*User, error)
	Update(user *User) error
	SaveRecoveryToken(token *PasswordRecoveryToken) error
	FindRecoveryToken(token string) (*PasswordRecoveryToken, error)
	MarkRecoveryTokenUsed(id uuid.UUID) error
	FindAllByCompany(companyID uuid.UUID) ([]*User, error)
}
