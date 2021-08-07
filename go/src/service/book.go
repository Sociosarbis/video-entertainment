package service

import (
	"context"
	"fmt"

	"github.com/golang/protobuf/ptypes/empty"
	bookPb "github.com/sociosarbis/grpc/go/proto/book"
)

type BookService struct {
	books []*bookPb.Book
	bookPb.UnimplementedBookServiceServer
}

func NewBookService() *BookService {
	return &BookService{
		books: []*bookPb.Book{{
			Isbn:  "0-670-81302-8",
			Title: "It",
			Author: &bookPb.Author{
				FirstName: "Stephen",
				LastName:  "King",
			},
		}},
	}
}

func (s BookService) ListBooks(ctx context.Context, empty *empty.Empty) (*bookPb.ListBookResponse, error) {
	return &bookPb.ListBookResponse{
		Books: s.books,
	}, nil
}

func (s BookService) DeleteBook(ctx context.Context, book *bookPb.DeleteBookRequest) (*bookPb.Book, error) {
	for i, item := range s.books {
		if item.Isbn == book.GetIsbn() || item.Title == book.GetTitle() {
			s.books[i] = s.books[len(s.books)-1]
			s.books = s.books[:len(s.books)-1]
			return item, nil
		}
	}
	return nil, fmt.Errorf("book not found %+v", book)
}

func (s BookService) CreateBook(ctx context.Context, book *bookPb.Book) (*bookPb.Book, error) {
	for _, item := range s.books {
		if item.Isbn == book.GetIsbn() || item.Title == book.GetTitle() {
			return nil, fmt.Errorf("book already exists %+v", book)
		}
	}
	s.books = append(s.books, book)
	return book, nil
}
