---
title: "对比分析 Dockerfile 中的 ENTRYPOINT 和 CMD"
slug: "dockerfile-entrypoint-vs-cmd"
date: "2017-11-15"
tags: ["options", "docker"]
excerpt: "Dockerfile 中的 ENTRYPOINT 指令和 CMD 指令都可以设置容器启动时要执行的命令，但用途是有略微不同的，本文将通过实验分析它们的不同之处，给出最佳实践。"
notoc: true
draft: false

---

## 概述

Dockerfile 中的 ENTRYPOINT 指令和 CMD 指令都可以设置容器启动时要执行的命令。

ENTRYPOINT 有两种形式:

- exec 模式，如 `ENTRYPOINT ["executable", "param1", "param2"]`
- shell 模式, 如 `ENTRYPOINT command param1 param2`

而 CMD 也有两种形式:

- exec 模式，如 `CMD ["executable","param1","param2"]`
  - 当有 entrypoint 时，executable 等价于 param, 官方手册将其也作为了一种模式，严格来讲这仍是 exec 模式。
- shell 模式，`CMD command param1 param2`

## 实验过程

为了研究它们的不同之处，我们通过实验，任意组合各种情形，分析其执行结果。

ENTRYPOINT 和 CMD 分别有好多种情形，彼此间的组合情况更多，为了简化描述，我们引入代号。

规则如下:

- e -> 表示 ENTRYPOINT
- c -> 表示 CMD
- 0 -> 表示 Dockerfile 中没有指令。
- 1 -> 表示 Dockerfile 中指令采用 exec 形式，且仅有一个参数。
- 2 -> 表示 Dockerfile 中指令采用 shell 形式，且仅由一个参数。
- 3 -> 表示 Dockerfile 中指令采用 exec 形式, 有多个参数。
- 4 -> 表示 Dockerfile 中指令采用 shll 形式, 有多个参数。

举例说明，e1c1 表示 Dockerfile 中同时存在 ENTRYPOINT 和 CMD，且是 exec 形式，仅用一个参数。
其 Dockerfile 如下：
```
// ./Dockerfile.e1c1

FROM alpine

COPY ./mycmd /usr/bin/

ENTRYPOINT ["/usr/bin/mycmd"]

CMD ["arg"]
```

mycmd 命令用来打印命令行参数，其内容如下：
```
#!/bin/sh

echo $@
```

实验中任意组合各种情况下的 ENTRYPOINT 和 CMD, 生成 Dockerfile。

创建和执行过程：
```
docker build -t e1c1 -f Dockerfile.e1c1 .
docker run -rm e1c1 
docker run -rm e1c1 a
```
收集 `docker run` 的输出，可以得到下表：

| N.O. | ENTRYPOINT              | CMD            | RUN      | OUPUT                                                      |
|------|-------------------------|----------------|----------|------------------------------------------------------------|
| e1c1 | ["/usr/bin/mycmd"]      | ["arg"]        |          | arg                                                        |
|      | ["/usr/bin/mycmd"]      | ["arg"]        | a        | a                                                          |
| e1c0 | ["/usr/bin/mycmd"]      |                |          |                                                            |
|      | ["/usr/bin/mycmd"]      |                | a        | a                                                          |
| e1c2 | ["/usr/bin/mycmd"]      | arg            |          | /bin/sh -c "arg"                                           |
|      | ["/usr/bin/mycmd"]      | arg            | a        | a                                                          |
| e2c0 | /usr/bin/mycmd          |                |          |                                                            |
|      | /usr/bin/mycmd          |                | a        |                                                            |
| e2c1 | /usr/bin/mycmd          | ["arg"]        |          |                                                            |
|      | /usr/bin/mycmd          | ["arg"]        | a        |                                                            |
| e2c2 | /usr/bin/mycmd          | arg            |          |                                                            |
|      | /usr/bin/mycmd          | arg            | a        |                                                            |
| e0c0 |                         |                |          |                                                            |
|      |                         |                | a        | docker: Error..."exec: \"a\": executable file not found... |
|      |                         |                | mycmd  a | a                                                          |
| e0c1 |                         | ["mycmd"]      |          |                                                            |
|      |                         | ["mycmd"]      | a        | docker: Error..."exec: \"a\": executable file not found... |
| e0c2 |                         | mycmd          |          |                                                            |
|      |                         | mycmd          | a        | docker: Error..."exec: \"a\": executable file not found... |
| e0c3 |                         | ["mycmd", "a"] |          | a                                                          |
|      |                         | ["mycmd", "a"] | a        | docker: Error..."exec: \"a\": executable file not found... |
| e0c4 |                         | mycmd a        |          | a                                                          |
|      |                         | mycmd a        | a        | docker: Error..."exec: \"a\": executable file not found... |
| e3c0 | ["/usr/bin/mycmd", "a"] |                |          | a                                                          |
|      | ["/usr/bin/mycmd", "a"] |                | b        | a b                                                        |
| e3c1 | ["/usr/bin/mycmd", "a"] | ["b"]          |          | a b                                                        |
|      | ["/usr/bin/mycmd", "a"] | ["b"]          | c        | a c                                                        |
| e3c2 | ["/usr/bin/mycmd", "a"] | b              |          | a /bin/sh -c "b"                                           |
|      | ["/usr/bin/mycmd", "a"] | b              | c        | a c                                                        |
| e4c0 | /usr/bin/mycmd a        |                |          | a                                                          |
|      | /usr/bin/mycmd a        |                | b        | a                                                          |
| e4c1 | /usr/bin/mycmd a        | ["b"]          |          | b: line 1: /usr/bin/mycmd a: not found                     |
|      | /usr/bin/mycmd a        | ["b"]          | c        | c: line 1: /usr/bin/mycmd a: not found                     |
| e4c2 | /usr/bin/mycmd a        | b              |          | /bin/sh: line 1: /usr/bin/mycmd a: not found               |
|      | /usr/bin/mycmd a        | b              | c        | c: line 1: /usr/bin/mycmd a: not found                     |

- N.O. -> 组合情形编号。
- ENTRYPOINT -> Dockerfile 中指令 ENTRYPOINT 的值。
- CMD ->  Dockerfile 中指令 CMD 的值。
- RUN 表示执行时传递给容器的值。
- OUTPUT 时执行后打印的结果。

## 结论

- e2 时 cmd 值全部无效，可以得出 **ENTRYPOINT 采用 shell 模式且没有参数时会忽略 cmd** 。
- e4 有 cmd 值全部报错，可以得出 **ENTRYPOINT 采用 shell 模式有参数时传入 cmd 会报错** 。
- 从 e2 和 e4 可以看出， **推荐使用 exec 模式配置 ENTRYPOINT** ，它接受 cmd 且更安全。
- docker run 中 **命令行传入的 cmd 会覆盖 Dockerfile 中的 CMD**。
- 根据 e1c2 和 e3c2， **Dockerfile 中 CMD 在 shell 模式下内部会被转换为前部拼接 ["/bin/sh", "-c"] 的 exec 模式**。
- 结合 e1c2 和 e3c2,  **推荐使用 exec 模式配置 CMD** 。
- 从 e3 可以得出： **Dockerfile 中的 ENTRYPOINT 在 exec 模式下自带的参数会与 cmd 参数拼接**
