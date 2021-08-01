package service

import (
	"context"
	"fmt"

	"github.com/golang/protobuf/ptypes/empty"
	"github.com/sociosarbis/grpc/proto/book"
)

type BookService struct {
	books []*book.Book
	book.UnimplementedBookServiceServer
}

func NewBookService() *BookService {
	return &BookService{
		books: []*book.Book{{
			Isbn:  "0-670-81302-8",
			Title: "It",
			Author: &book.Author{
				FirstName: "Stephen",
				LastName:  "King",
			},
		}},
	}
}

func (s BookService) ListBooks(ctx context.Context, empty *empty.Empty) (*book.ListBookResponse, error) {
	return &book.ListBookResponse{
		Books: s.books,
	}, nil
}

func (s BookService) DeleteBook(ctx context.Context, book *book.DeleteBookRequest) (*book.Book, error) {
	for i, item := range s.books {
		if item.Isbn == book.GetIsbn() || item.Title == book.GetTitle() {
			s.books[i] = s.books[len(s.books)-1]
			s.books = s.books[:len(s.books)-1]
			return item, nil
		}
	}
	return nil, fmt.Errorf("book not found %+v", book)
}

func (s BookService) CreateBook(ctx context.Context, book *book.Book) (*book.Book, error) {
	for _, item := range s.books {
		if item.Isbn == book.GetIsbn() || item.Title == book.GetTitle() {
			return nil, fmt.Errorf("book already exists %+v", book)
		}
	}
	s.books = append(s.books, book)
	return book, nil
}
