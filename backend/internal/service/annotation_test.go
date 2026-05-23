package service

import (
	"errors"
	"testing"
	"time"

	"github.com/client-support/backend/internal/domain"
	"github.com/google/uuid"
)

// Mock repositórios inline para AnnotationRepository e ProcessRepository
type mockAnnotationRepo struct {
	annotations map[uuid.UUID]*domain.Annotation
	createErr   error
	findByIDErr error
	updateErr   error
	deleteErr   error
}

func (m *mockAnnotationRepo) Create(a *domain.Annotation) error {
	if m.createErr != nil {
		return m.createErr
	}
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	m.annotations[a.ID] = a
	return nil
}

func (m *mockAnnotationRepo) FindByID(id uuid.UUID) (*domain.Annotation, error) {
	if m.findByIDErr != nil {
		return nil, m.findByIDErr
	}
	a, ok := m.annotations[id]
	if !ok {
		return nil, domain.ErrAnnotationNotFound
	}
	return a, nil
}

func (m *mockAnnotationRepo) FindAllByProcess(processID uuid.UUID, companyID uuid.UUID) ([]*domain.Annotation, error) {
	var list []*domain.Annotation
	for _, a := range m.annotations {
		if a.ProcessID == processID && a.CompanyID == companyID {
			list = append(list, a)
		}
	}
	return list, nil
}

func (m *mockAnnotationRepo) Update(a *domain.Annotation) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	m.annotations[a.ID] = a
	return nil
}

func (m *mockAnnotationRepo) Delete(id uuid.UUID) error {
	if m.deleteErr != nil {
		return m.deleteErr
	}
	if _, ok := m.annotations[id]; !ok {
		return domain.ErrAnnotationNotFound
	}
	delete(m.annotations, id)
	return nil
}

type mockProcessRepo struct {
	processes map[uuid.UUID]*domain.Process
	findErr   error
}

func (m *mockProcessRepo) Create(p *domain.Process) error {
	m.processes[p.ID] = p
	return nil
}

func (m *mockProcessRepo) FindByID(id uuid.UUID) (*domain.Process, error) {
	p, ok := m.processes[id]
	if !ok {
		return nil, errors.New("processo não encontrado")
	}
	return p, nil
}

func (m *mockProcessRepo) FindByIDAndCompany(id uuid.UUID, companyID uuid.UUID) (*domain.Process, error) {
	if m.findErr != nil {
		return nil, m.findErr
	}
	p, ok := m.processes[id]
	if !ok || p.CompanyID != companyID {
		return nil, errors.New("processo não encontrado")
	}
	return p, nil
}

func (m *mockProcessRepo) FindAll(companyID uuid.UUID, clientID *uuid.UUID, userID *uuid.UUID, status string, protocol string, page int, limit int) ([]*domain.Process, int, error) {
	return nil, 0, nil
}

func (m *mockProcessRepo) Update(p *domain.Process) error {
	m.processes[p.ID] = p
	return nil
}

func (m *mockProcessRepo) Delete(id uuid.UUID, companyID uuid.UUID) error {
	delete(m.processes, id)
	return nil
}

func (m *mockProcessRepo) FindAllByCompanyAndClient(companyID uuid.UUID, clientID uuid.UUID) ([]*domain.Process, error) {
	return nil, nil
}

func TestCreateAnnotation(t *testing.T) {
	companyID := uuid.New()
	processID := uuid.New()
	userID := uuid.New()

	annoRepo := &mockAnnotationRepo{annotations: make(map[uuid.UUID]*domain.Annotation)}
	procRepo := &mockProcessRepo{processes: make(map[uuid.UUID]*domain.Process)}

	// Seed process
	procRepo.processes[processID] = &domain.Process{
		ID:        processID,
		CompanyID: companyID,
	}

	service := NewAnnotationService(annoRepo, procRepo)

	// 1. Success Creation
	a1 := &domain.Annotation{
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "Nota válida de teste.",
		Visibility: domain.VisibilityPublic,
	}
	err := service.Create(a1)
	if err != nil {
		t.Fatalf("esperava sucesso na criação, erro: %v", err)
	}

	// 2. Empty Text validation
	a2 := &domain.Annotation{
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "  ",
		Visibility: domain.VisibilityPublic,
	}
	err = service.Create(a2)
	if err == nil {
		t.Fatal("esperava erro por anotação vazia, obteve sucesso")
	}

	// 3. Process not belonging to company
	a3 := &domain.Annotation{
		ProcessID:  processID,
		CompanyID:  uuid.New(), // outra empresa
		UserID:     userID,
		Annotation: "Nota para processo de outra empresa.",
		Visibility: domain.VisibilityPublic,
	}
	err = service.Create(a3)
	if err == nil {
		t.Fatal("esperava erro por processo não pertencente à empresa, obteve sucesso")
	}
}

func TestUpdateAnnotation(t *testing.T) {
	companyID := uuid.New()
	processID := uuid.New()
	userID := uuid.New()

	annoRepo := &mockAnnotationRepo{annotations: make(map[uuid.UUID]*domain.Annotation)}
	procRepo := &mockProcessRepo{processes: make(map[uuid.UUID]*domain.Process)}

	service := NewAnnotationService(annoRepo, procRepo)

	// Seed anotação dentro da janela (criada agora)
	annoID := uuid.New()
	annoRepo.annotations[annoID] = &domain.Annotation{
		ID:         annoID,
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "Nota original.",
		Visibility: domain.VisibilityPublic,
		CreatedAt:  time.Now(),
	}

	// 1. Success update
	updated, err := service.Update(annoID, "Nota atualizada.", userID, companyID)
	if err != nil {
		t.Fatalf("esperava sucesso no update, erro: %v", err)
	}
	if updated.Annotation != "Nota atualizada." {
		t.Fatalf("esperava nota atualizada, obteve: %s", updated.Annotation)
	}

	// 2. Failure: Not the owner
	_, err = service.Update(annoID, "Tentativa hacker.", uuid.New(), companyID)
	if err != domain.ErrAnnotationNotOwner {
		t.Fatalf("esperava erro de propriedade (ErrAnnotationNotOwner), obteve: %v", err)
	}

	// 3. Failure: Expired timeframe (16 minutes ago)
	expiredAnnoID := uuid.New()
	annoRepo.annotations[expiredAnnoID] = &domain.Annotation{
		ID:         expiredAnnoID,
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "Nota antiga.",
		Visibility: domain.VisibilityPublic,
		CreatedAt:  time.Now().Add(-16 * time.Minute),
	}

	_, err = service.Update(expiredAnnoID, "Tarde demais.", userID, companyID)
	if err != domain.ErrAnnotationModificationWindowExpired {
		t.Fatalf("esperava erro de janela estourada, obteve: %v", err)
	}
}

func TestDeleteAnnotation(t *testing.T) {
	companyID := uuid.New()
	processID := uuid.New()
	userID := uuid.New()

	annoRepo := &mockAnnotationRepo{annotations: make(map[uuid.UUID]*domain.Annotation)}
	procRepo := &mockProcessRepo{processes: make(map[uuid.UUID]*domain.Process)}

	service := NewAnnotationService(annoRepo, procRepo)

	// Seed
	annoID := uuid.New()
	annoRepo.annotations[annoID] = &domain.Annotation{
		ID:         annoID,
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "Vou sumir.",
		Visibility: domain.VisibilityPublic,
		CreatedAt:  time.Now(),
	}

	// 1. Failure: Not owner
	err := service.Delete(annoID, uuid.New(), companyID)
	if err != domain.ErrAnnotationNotOwner {
		t.Fatalf("esperava erro de propriedade no delete, obteve: %v", err)
	}

	// 2. Success Delete
	err = service.Delete(annoID, userID, companyID)
	if err != nil {
		t.Fatalf("esperava sucesso no delete, erro: %v", err)
	}

	// 3. Failure: Window expired
	expiredAnnoID := uuid.New()
	annoRepo.annotations[expiredAnnoID] = &domain.Annotation{
		ID:         expiredAnnoID,
		ProcessID:  processID,
		CompanyID:  companyID,
		UserID:     userID,
		Annotation: "Imutável.",
		Visibility: domain.VisibilityPublic,
		CreatedAt:  time.Now().Add(-20 * time.Minute),
	}

	err = service.Delete(expiredAnnoID, userID, companyID)
	if err != domain.ErrAnnotationModificationWindowExpired {
		t.Fatalf("esperava erro de janela estourada no delete, obteve: %v", err)
	}
}
