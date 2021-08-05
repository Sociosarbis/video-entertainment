package main

import (
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/handlerfunc"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"github.com/sociosarbis/grpc/proto/book"
	"github.com/sociosarbis/grpc/src/service"
	"google.golang.org/grpc"
)

func main() {
	log.Printf("starting container")
	bookServiceServer := service.NewBookService()
	grpcServer := grpc.NewServer()
	grpcWebServer := grpcweb.WrapServer(grpcServer)
	book.RegisterBookServiceServer(grpcServer, *bookServiceServer)
	log.Printf("starting lambda")
	lambda.Start(handlerfunc.NewV2(func(w http.ResponseWriter, req *http.Request) {
		header := w.Header()
		header.Set("Access-Control-Allow-Origin", "*")
		header.Set("Access-Control-Allow-Methods", "*")
		header.Set("Access-Control-Allow-Headers", "*")
		if req.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		grpcWebServer.ServeHTTP(w, req)
	}))

}
