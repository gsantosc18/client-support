package service

import (
	"errors"
	"strings"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

type AnnotationService struct {
	annoRepo    domain.AnnotationRepository
	processRepo domain.ProcessRepository
}

func NewAnnotationService(annoRepo domain.AnnotationRepository, processRepo domain.ProcessRepository) *AnnotationService {
	return &AnnotationService{
		annoRepo:    annoRepo,
		processRepo: processRepo,
	}
}

func (s *AnnotationService) Create(annotation *domain.Annotation) error {
	// 1. Validar conteúdo da anotação
	annotation.Annotation = strings.TrimSpace(annotation.Annotation)
	if annotation.Annotation == "" {
		return errors.New("o conteúdo da anotação não pode estar vazio")
	}
	if len(annotation.Annotation) > 10000 {
		return errors.New("o conteúdo da anotação não pode exceder 10.000 caracteres")
	}

	// 2. Validar visibilidade
	if annotation.Visibility != domain.VisibilityPublic && annotation.Visibility != domain.VisibilityPrivate {
		return errors.New("tipo de visibilidade inválido")
	}

	// 3. Validar se o processo existe e pertence ao mesmo tenant (company_id)
	proc, err := s.processRepo.FindByIDAndCompany(annotation.ProcessID, annotation.CompanyID)
	if err != nil || proc == nil {
		return errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	return s.annoRepo.Create(annotation)
}

func (s *AnnotationService) FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*domain.Annotation, error) {
	// Verificar se o processo existe e pertence à mesma empresa
	proc, err := s.processRepo.FindByIDAndCompany(processID, companyID)
	if err != nil || proc == nil {
		return nil, errors.New("processo não encontrado ou não pertence a esta empresa")
	}

	return s.annoRepo.FindAllByProcess(processID, companyID)
}

func (s *AnnotationService) Update(id uuid.UUID, newText string, userID uuid.UUID, companyID uuid.UUID) (*domain.Annotation, error) {
	// 1. Buscar a anotação existente
	annotation, err := s.annoRepo.FindByID(id)
	if err != nil {
		return nil, domain.ErrAnnotationNotFound
	}

	// 2. Validar multitenancy
	if annotation.CompanyID != companyID {
		return nil, errors.New("anotação não pertence a esta empresa")
	}

	// 3. Validar propriedade (ownership)
	if annotation.UserID != userID {
		return nil, domain.ErrAnnotationNotOwner
	}

	// 4. Validar janela de tempo de 15 minutos
	if time.Since(annotation.CreatedAt) > 15*time.Minute {
		return nil, domain.ErrAnnotationModificationWindowExpired
	}

	// 5. Validar conteúdo
	newText = strings.TrimSpace(newText)
	if newText == "" {
		return nil, errors.New("o conteúdo da anotação não pode estar vazio")
	}
	if len(newText) > 10000 {
		return nil, errors.New("o conteúdo da anotação não pode exceder 10.000 caracteres")
	}

	annotation.Annotation = newText
	annotation.UpdatedAt = time.Now()

	err = s.annoRepo.Update(annotation)
	if err != nil {
		return nil, err
	}

	return annotation, nil
}

func (s *AnnotationService) Delete(id uuid.UUID, userID uuid.UUID, companyID uuid.UUID) error {
	// 1. Buscar a anotação existente
	annotation, err := s.annoRepo.FindByID(id)
	if err != nil {
		return domain.ErrAnnotationNotFound
	}

	// 2. Validar multitenancy
	if annotation.CompanyID != companyID {
		return errors.New("anotação não pertence a esta empresa")
	}

	// 3. Validar propriedade (ownership)
	if annotation.UserID != userID {
		return domain.ErrAnnotationNotOwner
	}

	// 4. Validar janela de tempo de 15 minutos
	if time.Since(annotation.CreatedAt) > 15*time.Minute {
		return domain.ErrAnnotationModificationWindowExpired
	}

	return s.annoRepo.Delete(id)
}
