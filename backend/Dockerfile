# 构建镜像
FROM golang:1.22.11 AS builder
EXPOSE 8080
ENV CGO_ENABLED=0
ENV GOPROXY=https://goproxy.cn,http://mirrors.aliyun.com/goproxy/,direct
WORKDIR /app
COPY . .
RUN go build -o server

# 运行镜像
FROM alpine:latest AS runner
ENV TZ=Asia/Shanghai
WORKDIR /app
COPY --from=builder /app/server .
EXPOSE 8080
ENTRYPOINT [ "./server" ]