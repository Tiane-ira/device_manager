IMAGE_NAME=device-reservation-backend
VERSION=v0.0.1
NAME=devicema

# 删除容器
docker rm -f ${NAME}

# 运行容器
docker run -d --name ${NAME} -p 8080:8080 \
-v ${NAME}:/app/data \
${IMAGE_NAME}:${VERSION}