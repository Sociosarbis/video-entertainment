package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/handlerfunc"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	bookPb "github.com/sociosarbis/grpc/go/proto/book"
	"github.com/sociosarbis/grpc/go/src/service"
	"google.golang.org/grpc"
)

func main() {
	log.Printf("starting container")
	bookService := service.NewBookService()
	grpcServer := grpc.NewServer()
	grpcWebServer := grpcweb.WrapServer(grpcServer)
	bookPb.RegisterBookServiceServer(grpcServer, *bookService)
	log.Printf("starting lambda")
	lambda.Start(handlerfunc.New((func(w http.ResponseWriter, req *http.Request) {
		log.Printf("%s %s\n", req.RemoteAddr, req.Method)
		header := w.Header()
		proxyPath := req.Header.Get("X-Grpc-Method")
		req.Method = http.MethodPost
		if len(proxyPath) != 0 {
			req.URL.Path = proxyPath
		}
		if data, err := json.MarshalIndent(req.URL, "", "  "); err == nil {
			log.Printf("URL：%s", string(data))
		}
		if data, err := json.MarshalIndent(req.Header, "", "  "); err == nil {
			log.Printf("Header：%s", string(data))
		}
		header.Set("Access-Control-Allow-Origin", "*")
		header.Set("Access-Control-Allow-Methods", "*")
		header.Set("Access-Control-Allow-Headers", "*")
		if req.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		grpcWebServer.ServeHTTP(w, req)
	})).ProxyWithContext)

}
