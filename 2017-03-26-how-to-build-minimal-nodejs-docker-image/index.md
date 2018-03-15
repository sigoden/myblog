---
title: "创建极简 nodejs docker 镜像"
slug: "nodejszhi-chuang-jian-zui-xiao-dockerjing-xiang"
date: 2017-03-26
tags: ["howto", "nodejs", "docker"]
excerpt: "本文将介绍如何创建极简 node 镜像"

---

使用 docker 运行服务，你可以拥有一致的环境，可以精确控制服务的运行资源 (cpu, 内存），可以方便的设置端口和网络，可以使用镜像仓储管理和分发代码。现在越来越多的开发者选择将服务运行在 docker 上。

好多 nodejs 用户在使用 docker 时，直接使用了默认的 node 镜像。但你不觉得它太大了吗？现在`node:6.10.1`镜像的体积已经达到 666M，其实要实现同样的功能，只需 43.5M 就够了。尺寸小，意味者更低的资源消耗，更快的下载速度，更小的传输带宽。

下面一起来揭露技巧。

## FROM: 设置 alpine 基础镜像

目前 docker 下最轻量的操作系统是 alpine, 一个 alpine 的体积不到 5M。node 默认镜像依赖的基础镜像是 debian, `debian:jessie`体积已打 123M, 所以想减小尺寸，首要就是从基础镜像切换到 alpine。

```
FROM alpine:3.7
```

## RUN: 设置 node 用户

```
adduser -D -u 1000 node
```
设置 node 用户是可选的。添加用户后在运行容器是可以指定已 node 用户的身份运行服务

## RUN: 安装 node 编译工具
```
apk add --no-cache \
    libstdc++ \
&& apk add --no-cache --virtual .build-deps \
    binutils-gold \
    curl \
    g++ \
    gcc \
    gnupg \
    libgcc \
    linux-headers \
    make \
    python
```
- `apk add --no-cache`不使用本地缓存安装包数据库，直接从远程获取安装包信息安装。这样我们就不必通过`apk update`获取安装包数据库了
- `apk add --virtual .build-deps`将本次安装的所有包封装成一个名为.build-deps 的虚拟包。这样做的好处是可以通过`apk del .build-deps`一键清除这些包

## RUN: 导入 node 源码包公钥

```
for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
; do \
gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
done
```
这些公钥将用来校验我们通过 curl 下载的 nodejs 源码文件

## RUN: 下载并 node 校验源码文件

```
curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION.tar.xz" \
&& curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
&& gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
&& grep " node-v$NODE_VERSION.tar.xz\$" SHASUMS256.txt | sha256sum -c -
```
- `$NODE_VERSION`: 指 node 版本，如 6.10.1

## RUN: 编译安装 node

```
tar -xf "node-v$NODE_VERSION.tar.xz" \
&& cd "node-v$NODE_VERSION" \
&& ./configure \
&& make -j$(getconf _NPROCESSORS_ONLN) \
&& make install
```
- 如果不需要 npm, 可以替换第三行为`&& ./configure --without-npm`
- `$NODE_VERSION`: 指 node 版本，如 6.10.1

## RUN: 清理

```
apk del .build-deps \
&& cd .. \
&& rm -Rf "node-v$NODE_VERSION" \
&& rm "node-v$NODE_VERSION.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt
```
- `$NODE_VERSION`: 指 node 版本，如 6.10.1

## CMD: 设置镜像入口为 node

```
CMD [ "node" ]
```

上面为创建 nodejs 镜像必须步骤，下面的步骤根据需要添加

## 安装 yarn

- 安装依赖
  ```
  apk add --no-cache --virtual .build-deps-yarn curl gnupg
  ```
- 导入公钥
 ```
 for key in \
 6A010C5166006599AA17F08146C2130DFD2497F5 \
 ; do \
   gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
 done
 ```
- 下载校验
 ```
  curl -fSL -o yarn.js "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js" \
  && curl -fSL -o yarn.js.asc "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-legacy-$YARN_VERSION.js.asc" \
  && gpg --batch --verify yarn.js.asc yarn.js \
  && rm yarn.js.asc
 ```
 > `$YARN_VERSION`: 指 yarn 版本，如 0.22

- 安装
 ```
 mv yarn.js /usr/local/bin/yarn \
 && chmod +x /usr/local/bin/yarn \
 ```
- 清理
 ```
 apk del .build-deps-yarn
 ```
## c++ 插件

如果要支持 c++ 插件，还需安装 python,make,g++
```
apk add --no-cache python make g++
```
## headers 文件

有些 c++ 模块使用过程中还需要下载 node-headers 文件，node-headers 文件国内下载不稳定，建议也集成到镜像里，否则你可能碰到一个包编译很久没动静的情况。

- 参考 nodejs 源码下载校验步骤对 headers 文件进行下载校验
 ```
 curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v${NODE_VERSION}-headers.tar.xz"
 ```
- 安装 headers 文件
 ```
 mkdir /root/.node-gyp
 tar --strip-component 1 -xzf node-v${NODE_VERSION}-heraders.tar.xz /root/.node-gyp/$NODE_VERSION
 rm -rf node-v${NODE_VERSION}-headers.tar.xz
 ```
> `$NODE_VERSION`: 指 node 版本，如 6.10.1
