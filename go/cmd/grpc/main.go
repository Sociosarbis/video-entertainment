package main

import (
	"bytes"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"context"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/handlerfunc"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	bookPb "github.com/sociosarbis/grpc/go/proto/book"
	"github.com/sociosarbis/grpc/go/src/service"
	"google.golang.org/grpc"
)

const (
	GRPC_HEADER_SIZE = 5
)

type Handler struct {
	server *grpcweb.WrappedGrpcServer
}

func NewHandler(server *grpcweb.WrappedGrpcServer) *Handler {
	return &Handler{
		server,
	}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	log.Printf("%s %s\n", req.RemoteAddr, req.Method)
	header := w.Header()
	proxyPath := req.Header.Get("X-Grpc-Method")
	body, err := ioutil.ReadAll(req.Body)
	if err == nil {
		log.Printf("body(%v): %s", len(body), string(body))
	} else {
		panic(err)
	}
	req.Body.Close()
	req.Body = ioutil.NopCloser(bytes.NewBuffer(body))
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
	h.server.ServeHTTP(w, req)
}

func main() {
	log.Printf("starting container")
	bookService := service.NewBookService()
	grpcServer := grpc.NewServer()
	grpcWebServer := grpcweb.WrapServer(grpcServer)
	bookPb.RegisterBookServiceServer(grpcServer, *bookService)
	log.Printf("starting lambda")
	h := NewHandler(grpcWebServer)
	if os.Getenv("GO_ENV") == "development" {
		log.Printf("listen at 8003")
		if err := http.ListenAndServe(":8003", h); err != nil {
			panic(err)
		}
		return
	}
	lambda.Start(func(ctx context.Context, event events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
		log.Printf("raw body(%v;encoded:%v): %s(%v)", len([]byte(event.Body)), event.IsBase64Encoded, event.Body, len(event.Body))
		event.IsBase64Encoded = true
		return handlerfunc.New(h.ServeHTTP).ProxyWithContext(ctx, event)
	})

}
