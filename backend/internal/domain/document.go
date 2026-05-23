package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

var (
	ErrDocumentNotFound    = errors.New("documento não encontrado")
	ErrDocumentNotOwner    = errors.New("apenas o criador do documento ou operador autorizado pode alterá-lo ou excluí-lo")
	ErrDocumentInvalidType = errors.New("tipo de arquivo inválido ou não suportado")
	ErrDocumentTooLarge    = errors.New("o arquivo excede o limite máximo permitido de 10MB")
	ErrDocumentInvalidName = errors.New("o nome do documento não pode estar vazio")
)

type Document struct {
	ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:uuid_generate_v4()"`
	Name        string    `json:"name" gorm:"type:varchar(255);not null"`
	Description string    `json:"description" gorm:"type:text"`
	FilePath    string    `json:"file_path" gorm:"type:varchar(512);not null"`
	FileType    string    `json:"file_type" gorm:"type:varchar(100);not null"`
	FileSize    int64     `json:"file_size" gorm:"type:integer;not null"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:uuid;not null"`
	ProcessID   uuid.UUID `json:"process_id" gorm:"type:uuid;not null"`
	CompanyID   uuid.UUID `json:"company_id" gorm:"type:uuid;not null"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type DocumentRepository interface {
	Create(document *Document) error
	FindByID(id uuid.UUID) (*Document, error)
	FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*Document, error)
	Update(document *Document) error
	Delete(id uuid.UUID) error
}
