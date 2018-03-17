---
title: "在 Bash 中使用 getopt 解析命令行参数"
slug: "how-to-use-getopt-to-build-cli"
date: "2017-09-16"
tags: ["howto", "linux", "bash"]
excerpt: "有时我们需要自动化一些作业，这就需要编写 BashScript。为了控制脚本的行为，我们有两种选择: 环境变量和命令行参数。BashScript 中解析命令行参数常常会用到 getopt。"
notoc: false
draft: false

---

## getopt 是什么

getopt 是一个 c 编写的程序，提供参数解析功能。它是为了替换 bash 内置的老的 getopts 函数。如果设置了 `GETOPT_COMPATIBLE` 环境变量，可以像使用 getopts 函数一样使用 getopt 命令。

getopt vs getopts

- getopts 是 bash 内建命令的， 而 getopt 是外部命令(所以发行版都有装)。
- getopts 不支持长选项， 比如： `--date`。
- getopt 支持选项重排。
  > 选项重排指可以将带 `-` 或 `-–` 的参数写在其他参数的前面，也可以写在后面。如 `mycmd -a abc edf -d` 进重排变为 `mycmd -a abc -d -- edf`
- 选项约束不满足时，如必选参数缺失，getopt 会报警，而 getopts 需要自己实现。


## 命令行概述

结合一个常见的命令进行分析

```
curl -X POST --data 'a=3' httpbin.org/post
```

getopt 将命令行参数划分为三类: 短选项(`-x`), 长选项(`--data`), 位置参数 (`httpbin.org/post`)。其中选项可以接或不接参数。


### 短选项

短选项由 `-`(单个破折号) 接单字母组成，字母区分大小写如 `-X`, `-a` ，可以接0到1个参数。

- 不带参数如 `-I`, `-f`，作为标志位。
- 带参数
  - 空格形式 `-X POST`, `-f @demo.txt`
  - 略去空格形式 `-XPOST`

### 长选项

长选项由 `--`(两个连续的破折号)和任意长度的字母数字组成，如 `-cookie-jar`，同样可接或不接参数。

- 不带参数如 `--crlf`，作为标志位。
- 带参数
  - 以空格隔开选项和参数，`--data 'a=3'`
  - 以 `=` 连接选项和参数，`--data='a=3'`

## 选项字符串

如何告知 getopt 使其能以我们期望的方式解析选项和参数呢？需要先将选项编码为选项字符串。

getopt 识别两种选项字符串 ，一种用来配置短选项解析，另一种则是用来解析长选项。

### 短选项

getopt 也是一个命令行程序，它也是接受选项的。短选项字符串通过选项 `-o` 或 `--options` 传递。

编码规则如下：

- 每个字母均代表一个短选项。
- 字母后如果接 `:`(单个冒号), 代表这个选项必须接一个参数。
- 字母后如果接 `::`(两个冒号), 代表这个选项可接或不接参数。
  - 带参数时，选项与参数采用空格形式，`-a3` 合法，而 `-a 3`非法。
- 字母后没有冒号，代表这个选项不接参数。


举例分析:

选项字符串 `a:bc::`，表示有三个短选项，`-a` 必须接一个参数，`-b` 不接参数，`-c` 接可选参数。

### 长选项

长选项字符串通过选项 `-l` 或 `--longoptions` 传递。

编码规则如下：

- 多个选项用 `,`(逗号)隔开。
- 字母后如果接 `:`(单个冒号), 代表这个选项必须接一个参数。
- 字母后如果接 `::`(两个冒号), 代表这个选项可接或不接参数。
  - 带参数时，选项与参数需要使用 `=` 形式连接，`--long=abc` 合法，而 `--long abc`非法。
- 字母后没有冒号，代表这个选项不接参数。

举例分析:

选项字符串 `getopt -l foo,bar::,baz:`，表示有三个长选项，`--foo` 不接参数，`--bar` 参数可选，`--baz` 必须接一个参数。


## 用法

知道如何配置了，但具体如何使用呢？

```bash
#!/bin/bash

# 选项 `-a` 和 `--arga` 接可选参数
# 选项 `-b` 和 `--argb` 不接参数，充当莫种标志
# 选项 `-c` 和 `--argc` 必须接一个参数 

ARG_B=0

# 读取命令行参数, `-n` 指定命令名，报错时用到。
TEMP=`getopt -o a::bc: -l arga::,argb,argc: -n 'mycmd' -- "$@"`
eval set -- "$TEMP"

# 提取选项和其参数
while true ; do
    case "$1" in
        -a|--arga)
            case "$2" in
                "") ARG_A='some default value' ; shift 2 ;;
                *) ARG_A=$2 ; shift 2 ;;
            esac ;;
        -b|--argb) ARG_B=1 ; shift ;;
        -c|--argc)
            case "$2" in
                "") shift 2 ;;
                *) ARG_C=$2 ; shift 2 ;;
            esac ;;
        --) shift ; break ;;
        *) echo "Internal error!" ; exit 1 ;;
    esac
done

echo "ARG_A = $ARG_A"
echo "ARG_B = $ARG_B"
echo "ARG_C = $ARG_C"
```

## 结论

在 BashScript 中使用 getopt，可以让命令行的解析提取变得直白优雅。
上面介绍的部分已经足够日常使用了。但并没有涵盖 getopt 全部功用，更多需求可以查询其手册。
