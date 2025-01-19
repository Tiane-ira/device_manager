# !/bin/bash

image_name=device-reservation
version=v0.0.1

backend_image=${image_name}-backend:${version}
frontend_image=${image_name}-frontend:${version}

workdir=$(pwd)

# 构建后端
echo "开始构建后端"
cd $workdir/backend
docker build -t $backend_image .
echo "后端构建完成"

# 构建前端
echo "开始构建前端"
cd $workdir/frontend
docker build -t $frontend_image .
echo "前端构建完成"

echo "开始打包"
cd $workdir/output
pkg_name=${image_name}-${version}
rm -rf $pkg_name
mkdir -p $pkg_name
docker save -o $pkg_name/server.tar.gz $backend_image $frontend_image
cp -f docker-compose.yaml $pkg_name
tar -zcf ${pkg_name}.tar.gz $pkg_name
echo "打包完成"
