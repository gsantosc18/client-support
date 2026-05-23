package storage

import (
	"io"
	"os"
	"path/filepath"
)

type LocalStorage struct {
	basePath string
}

func NewLocalStorage(basePath string) *LocalStorage {
	_ = os.MkdirAll(basePath, os.ModePerm)
	_ = os.MkdirAll(filepath.Join(basePath, "trash"), os.ModePerm)
	return &LocalStorage{basePath: basePath}
}

func (s *LocalStorage) Upload(key string, file io.Reader, size int64, contentType string) error {
	fullPath := filepath.Join(s.basePath, key)
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	out, err := os.Create(fullPath)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	return err
}

func (s *LocalStorage) Download(key string) (io.ReadCloser, error) {
	fullPath := filepath.Join(s.basePath, key)
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, err
	}
	return file, nil
}

func (s *LocalStorage) TagAsDeleted(key string) error {
	fullPath := filepath.Join(s.basePath, key)
	tagPath := fullPath + ".tag"
	return os.WriteFile(tagPath, []byte("deleted:true"), 0644)
}

func (s *LocalStorage) MoveToTrash(oldKey string, newKey string) error {
	oldFullPath := filepath.Join(s.basePath, oldKey)
	newFullPath := filepath.Join(s.basePath, newKey)

	dir := filepath.Dir(newFullPath)
	if err := os.MkdirAll(dir, os.ModePerm); err != nil {
		return err
	}

	err := os.Rename(oldFullPath, newFullPath)
	if err != nil {
		in, err := os.Open(oldFullPath)
		if err != nil {
			return err
		}
		defer in.Close()

		out, err := os.Create(newFullPath)
		if err != nil {
			return err
		}
		defer out.Close()

		if _, err = io.Copy(out, in); err != nil {
			return err
		}
		_ = os.Remove(oldFullPath)
	}

	tagPath := newFullPath + ".tag"
	_ = os.WriteFile(tagPath, []byte("deleted:true"), 0644)

	return nil
}
