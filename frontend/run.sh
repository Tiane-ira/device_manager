IMAGE_NAME=device-reservation-frontend
VERSION=v0.0.1
NAME=devicema_frontend

# 删除容器
docker rm -f ${NAME}

# 运行容器
docker run -d --name ${NAME} -p 8088:8088 \
-v ${NAME}:/var/log/nginx \
${IMAGE_NAME}:${VERSION}