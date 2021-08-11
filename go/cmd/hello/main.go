package main

import (
	"context"
	"encoding/json"
	"log"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(ctx context.Context, req *events.APIGatewayWebsocketProxyRequest) (*events.APIGatewayProxyResponse, error) {
	log.Printf("%s\n", req.HTTPMethod)
	log.Printf("URL：%s", req.Path)
	data, err := json.MarshalIndent(req.Headers, "", "  ")
	if err == nil {
		log.Printf("Header：%s", string(data))
	}
	return &events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       string(data),
	}, nil
}

func main() {
	log.Printf("starting container")
	log.Printf("starting lambda")
	lambda.Start(handler)
}
