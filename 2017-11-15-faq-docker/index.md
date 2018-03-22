---
title: "Docker 一问一答"
slug: "docker-faq"
date: "2017-11-15"
tags: ["faq", "docker"]
excerpt: "介绍并汇总 Docker 使用一些注意事项，技巧，心得"
draft: false

---

## 最小的镜像是？

[scratch](https://hub.docker.com/_/scratch/)

scratch 镜像很赞，它简洁、小巧而且快速， 它没有 bug、安全漏洞、延缓的代码或技术债务。这是因为它基本上是空的。
scratch 镜像不能执行一些常规的 `pull`, `run`, `tag` 等 docker 命令，只能通过 Dockerfile 执行 `FROM scratch` 间接引用。
而且该指令并不生成新的数据层，相当于 metadata。

它适用于直接包装单个命令，类似于:

```Dockerfile
FROM scratch
COPY hello /
CMD ["/hello"]
```


## 最小的操作系统镜像？

[alpine](https://hub.docker.com/_/alpine/)

alpine 镜像封装了最小的操作系统 [alpine](https://www.alpinelinux.org), 体积只用 5M，有包管理器 apk。很适合作为基础镜像，特别适合生产环境，够小又够用。


## 多阶段构建 ？

[多阶段构建](https://docs.docker.com/develop/develop-images/multistage-build/#use-multi-stage-builds)可以用来优化 Dockerfile，减小镜像体积。

在生产环境中，我们通常只需要用到可执行文件，但为了生成构建该可执行文件，我们常常需要安装一些额外编译工具、库，这造成最后生成的镜像很脏很大。如果能把构建方面的工作和打包应用的工作分开，单一职责，我们就能优雅的得到干净的生产环境镜像了。多阶段构建就是用来完成这项工作。

以 Go 应用举例
```
FROM golang:1.7.3 as builder
WORKDIR /go/src/github.com/alexellis/href-counter/
RUN go get -d -v golang.org/x/net/html  
COPY app.go    .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o app .

FROM alpine:latest  
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /go/src/github.com/alexellis/href-counter/app .
CMD ["./app"]  
```
构建阶段生成可执行文件，封装阶段直接复制前面构建的可执行文件打包成镜像，这样我们就得到干净的小很多的使用生产环境下的应用镜像了。


## 调整指令顺序会优化构建吗？

会，Docker 会缓存每部指令执行的数据层，如果检测到没有变动，会优先使用缓存，这能减少构建时间和资源消耗了。

缓存是有顺序的，如果前面的缓存失效了，后面指令的缓存会被全部抛弃。所以应尽量将 **不容易变动的指令前置，容易变动的指令后置** 。 


## 构建缓存有哪些注意事项？

- 会实际产生缓存的命令只有 `RUN`, `COPY`, `ADD`，其它指令只会产生临时数据层。

- Dockerfile 如果有变动，会从变动起始地方抛弃之后所有的缓存。

- `RUN` 是靠 Dockerfile 中该指令的内容来判断缓存失效的。`RUN apt-get -y update` 会使用缓存，不管源是否有更新。

- `COPY` 和 `ADD` 会校验文件是否变动判断缓存失效。


## 构建时如何忽略文件？

使用 [.dockerignore ](https://docs.docker.com/engine/reference/builder/#dockerignore-file)

默认情况下，docker 会将 Dockerfile 所在的目录的所有文件（递归）全部包含到镜像编译上下文中，里面的一些无用的文件会增加编译时间，如果包含到最终镜像文件中，还会造成镜像不必要臃肿。
可以在 Dockerfile 所在目录创建 .dockerignore 文件，用以忽略不必要的文件。


## Dockerfile 如何嵌入文件？

```Docekerfile
RUN echo $'server {\n\
    listen          80;\n\
    server_name     example.com;\n\
    location / {\n\
      proxy_pass      http://localhost:8080;\n\
    }\n\
}'\
>> /etc/nginx/conf.d/server.conf
```

## ADD 和 COPY 的区别？

- COPY 从文件系统复制文件到镜像
- COPY 优先使用
- ADD 包含了 COPY 的功能
- ADD 复制并解压压缩文件，如 `ADD rootfs.tar.xz /`
- ADD 可以从 URL 下载文件到镜像，到并不会解压下载的压缩文件

## 命令行

### 一键清理

```
docker system prune
```

会清理所以没有使用的资源，包括 `image`, `volume`，`network`。

### 清除无用数据卷

```
docker volume rm $(docker volume ls -q -f "dangling=true")
```

### 清除退出的容器

```
docker rm $(docker ps -q -f "status=exited")
```

### 清除无标示镜像

```
docker rmi $(docker images -q -f "dangling=true")
```

### 自动移除交互容器

```
docker run -it --rm alpine
```
`--rm` 标志在容器退出时自动删除

### 表格形式显示时自定义栏目

```
docker ps --format "table {{.ID}}\t {{.Image}}\t {{.Status}}"
```

### 使用 JSON 筛选和打印特定内容

```
docker info --format "{{json .Plugins}}" | jq .
```
