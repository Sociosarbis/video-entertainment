### a personal and crude video player
[![Netlify Status](https://api.netlify.com/api/v1/badges/e89a1f25-577d-4bd8-9f1e-6de56bf9c040/deploy-status)](https://app.netlify.com/sites/sociosarbis-media-player/deploys)


### Generate protobuf binding codes
```bash
protoc --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative <PROTO_FILES...>
```
