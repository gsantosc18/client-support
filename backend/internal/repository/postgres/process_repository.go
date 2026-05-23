package postgres

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProcessRepository struct {
	db *gorm.DB
}

func NewProcessRepository(db *gorm.DB) *ProcessRepository {
	return &ProcessRepository{db: db}
}

func (r *ProcessRepository) Create(process *domain.Process) error {
	// GORM many2many mapping inserts into client_processes
	return r.db.Omit("User", "Establishment", "Clients.*").Create(process).Error
}

func (r *ProcessRepository) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	var process domain.Process
	err := r.db.Preload("Clients").Preload("User").Preload("Establishment").
		Where("id = ? AND company_id = ?", id, companyID).First(&process).Error
	if err != nil {
		return nil, err
	}
	return &process, nil
}

func (r *ProcessRepository) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*domain.Process, int, error) {
	var processes []*domain.Process
	var total int64

	query := r.db.Model(&domain.Process{}).Where("processes.company_id = ?", companyID)

	if clientID != nil {
		query = query.Joins("JOIN client_processes ON client_processes.process_id = processes.id").
			Where("client_processes.client_id = ?", *clientID)
	}

	if userID != nil {
		query = query.Where("processes.user_id = ?", *userID)
	}

	if status != "" {
		query = query.Where("processes.status = ?", status)
	}

	if protocol != "" {
		searchTerm := fmt.Sprintf("%%%s%%", strings.ToLower(protocol))
		query = query.Where("LOWER(processes.protocol) LIKE ?", searchTerm)
	}

	// Contagem total
	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Paginação e Preloads
	offset := (page - 1) * limit
	err = query.Preload("Clients").Preload("User").Preload("Establishment").
		Limit(limit).Offset(offset).Order("processes.created_at DESC").Find(&processes).Error
	if err != nil {
		return nil, 0, err
	}

	return processes, int(total), nil
}

func (r *ProcessRepository) Update(process *domain.Process) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Atualiza os campos básicos
		if err := tx.Omit("Clients", "User", "Establishment").Save(process).Error; err != nil {
			return err
		}
		// Sincroniza a associação many-to-many com os novos clientes
		if err := tx.Model(process).Association("Clients").Replace(process.Clients); err != nil {
			return err
		}
		return nil
	})
}

func (r *ProcessRepository) Delete(id uuid.UUID, companyID uuid.UUID) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var process domain.Process
		if err := tx.Preload("Clients").Preload("Establishment").Where("id = ? AND company_id = ?", id, companyID).First(&process).Error; err != nil {
			return err
		}

		// Marshal the full process data to JSON
		processJSON, err := json.Marshal(process)
		if err != nil {
			return err
		}

		// Save in deleted_processes
		deletedProc := &domain.DeletedProcess{
			ID:        uuid.New(),
			Data:      processJSON,
			DeletedAt: time.Now(),
		}
		if err := tx.Create(deletedProc).Error; err != nil {
			return err
		}

		// Save the establishment ID for deletion later
		estID := process.EstablishmentID

		// Clear client relations in client_processes associative table
		if err := tx.Model(&process).Association("Clients").Clear(); err != nil {
			return err
		}

		// Delete process row
		if err := tx.Unscoped().Delete(&process).Error; err != nil {
			return err
		}

		// Delete associated establishment row
		if err := tx.Unscoped().Delete(&domain.Establishment{ID: estID}).Error; err != nil {
			return err
		}

		return nil
	})
}
