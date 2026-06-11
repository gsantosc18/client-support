package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type AnnotationVisibility string

const (
	VisibilityPublic  AnnotationVisibility = "PUBLIC"
	VisibilityPrivate AnnotationVisibility = "PRIVATE"
)

var (
	ErrAnnotationNotFound                = errors.New("anotação não encontrada")
	ErrAnnotationModificationWindowExpired = errors.New("o limite de 15 minutos para edição/exclusão expirou")
	ErrAnnotationNotOwner                = errors.New("apenas o criador da anotação pode editá-la ou excluí-la")
	ErrAnnotationUnauthorized            = errors.New("não autorizado a visualizar esta anotação")
)

type Annotation struct {
	ID         uuid.UUID            `json:"id" gorm:"type:char(36);primary_key;default:(uuid())"`
	ProcessID  uuid.UUID            `json:"process_id" gorm:"type:char(36);not null"`
	CompanyID  uuid.UUID            `json:"company_id" gorm:"type:char(36);not null"`
	UserID     uuid.UUID            `json:"user_id" gorm:"type:char(36);not null"`
	User       *User                `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Annotation string               `json:"annotation" gorm:"type:text;not null"`
	Visibility AnnotationVisibility `json:"visibility" gorm:"type:varchar(10);not null;default:'PUBLIC'"`
	CreatedAt  time.Time            `json:"created_at"`
	UpdatedAt  time.Time            `json:"updated_at"`
}

type AnnotationRepository interface {
	Create(annotation *Annotation) error
	FindByID(id uuid.UUID) (*Annotation, error)
	FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*Annotation, error)
	Update(annotation *Annotation) error
	Delete(id uuid.UUID) error
}
