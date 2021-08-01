package main

import (
	"log"
	"net"

	"github.com/sociosarbis/grpc/proto/book"
	"github.com/sociosarbis/grpc/src/service"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
)

func main() {
	log.Printf("starting container")
	port := "8070"
	lis, err := net.Listen("tcp", ":"+port)
	if err != nil {
		log.Printf("Got error: %+v", err)
	}

	bookServiceServer := service.NewBookService()
	grpcServer := grpc.NewServer()
	book.RegisterBookServiceServer(grpcServer, *bookServiceServer)
	reflection.Register((grpcServer))

	if err := grpcServer.Serve(lis); err != nil {
		log.Println("got an error", err)
	}
}
