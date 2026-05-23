package domain

import "io"

type FileStorage interface {
	Upload(key string, file io.Reader, size int64, contentType string) error
	Download(key string) (io.ReadCloser, error)
	TagAsDeleted(key string) error
	MoveToTrash(oldKey string, newKey string) error
}
