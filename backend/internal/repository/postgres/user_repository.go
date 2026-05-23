package postgres

import (
	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *domain.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByEmailAndCompany(email string, companyID uuid.UUID) (*domain.User, error) {
	var user domain.User
	err := r.db.Where("email = ? AND company_id = ?", email, companyID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByID(id uuid.UUID) (*domain.User, error) {
	var user domain.User
	err := r.db.Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) Update(user *domain.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) SaveRecoveryToken(token *domain.PasswordRecoveryToken) error {
	return r.db.Create(token).Error
}

func (r *UserRepository) FindRecoveryToken(token string) (*domain.PasswordRecoveryToken, error) {
	var recoveryToken domain.PasswordRecoveryToken
	err := r.db.Where("token = ?", token).First(&recoveryToken).Error
	if err != nil {
		return nil, err
	}
	return &recoveryToken, nil
}

func (r *UserRepository) MarkRecoveryTokenUsed(id uuid.UUID) error {
	return r.db.Model(&domain.PasswordRecoveryToken{}).Where("id = ?", id).Update("used", true).Error
}

func (r *UserRepository) FindAllByCompany(companyID uuid.UUID) ([]*domain.User, error) {
	var users []*domain.User
	err := r.db.Where("company_id = ? AND status = ?", companyID, domain.UserStatusActive).Find(&users).Error
	return users, err
}

