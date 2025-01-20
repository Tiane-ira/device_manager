# 运行依赖
- docker
- docker-compose

# 构建依赖
构建后输出为docker镜像，构建过程中依赖镜像列表：
- golang:1.22.11    后端打包依赖
- node:20.18.1      前端打包依赖
- nginx:1.27.3      前端运行依赖
- alpine:latest     后端运行依赖

# 构建

```sh
sh build.sh
```

# 运行
```sh
# 解压并读取docker镜像
cd output
tar xzf device-reservation-v0.0.1.tar.gz
cd device-reservation-v0.0.1
docker load -i server.tar.gz
# 运行
docker-compose up -d
```