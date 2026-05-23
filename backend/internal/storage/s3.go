package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3Storage struct {
	client *s3.Client
	bucket string
}

func NewS3Storage(client *s3.Client, bucket string) *S3Storage {
	return &S3Storage{
		client: client,
		bucket: bucket,
	}
}

func (s *S3Storage) Upload(key string, file io.Reader, size int64, contentType string) error {
	_, err := s.client.PutObject(context.TODO(), &s3.PutObjectInput{
		Bucket:        aws.String(s.bucket),
		Key:           aws.String(key),
		Body:          file,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(contentType),
	})
	return err
}

func (s *S3Storage) Download(key string) (io.ReadCloser, error) {
	output, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	return output.Body, nil
}

func (s *S3Storage) TagAsDeleted(key string) error {
	_, err := s.client.PutObjectTagging(context.TODO(), &s3.PutObjectTaggingInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
		Tagging: &types.Tagging{
			TagSet: []types.Tag{
				{
					Key:   aws.String("deleted"),
					Value: aws.String("true"),
				},
			},
		},
	})
	return err
}

func (s *S3Storage) MoveToTrash(oldKey string, newKey string) error {
	copySource := fmt.Sprintf("%s/%s", s.bucket, oldKey)
	_, err := s.client.CopyObject(context.TODO(), &s3.CopyObjectInput{
		Bucket:     aws.String(s.bucket),
		CopySource: aws.String(copySource),
		Key:        aws.String(newKey),
	})
	if err != nil {
		return err
	}

	_, err = s.client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(oldKey),
	})
	if err != nil {
		return err
	}

	return s.TagAsDeleted(newKey)
}
