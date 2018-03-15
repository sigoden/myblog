---
title: "探究 logstash grok 文本解析"
slug: "logstash-grok-wen-ben-jie-xi"
date: "2017-04-07"
tags: ["howto", "elk", "grok", "logstash"]
excerpt: "Logstash 常用于 ELK 栈(在日志处理领域被广泛使用), 主要负责数据的收集，处理，转发。而 grok 是 filters 模块中一个文本正则解析插件。只有理解了 grok, 我们才能从容应对各种各样的日志内容，本文结合实例详细分析了如何使用 grok。"

---

## 试错环境

文本的解析规则的编写相对来说还是挺复杂的，我们需要搭建一个调试环境，以便我们试错。

配置 logstash 从标准终端输入中读取数据，grok 解析后，rubydebug 编码后打印到标准终端。

对应配置文件 logstash.conf 如下
```
input {
	stdin {
	}
}

filter {
	grok {
		match => {
			"message" => '%{DATA}'
		}
	}
}

output {
  stdout { codec => rubydebug }
}
```

Logstash 进行了分层设计，input 模块进行日志接受，filters 模块进行日志处理，output 模块进行日志转发，此外还提供了 codecs 模块可以对输入输出信息进行编码解码。各层在配置中也存在着对应。

rubydebug 用来输出结构化数据。

启动 logstash
```
logstash -f logstash.conf
```

logstash 成功启动后，终端中输入
```
hello
```
logstash 将打印
```
{
    "@timestamp" => 2017-04-08T03:08:10.999Z,
      "@version" => "1",
          "host" => "612edb7645b3",
       "message" => "hello",
          "tags" => []
}
```
整个试错环境运行成功

## 解析规则

### 正则规则
grok 使用的是 [Oniguruma 正则](https://raw.githubusercontent.com/kkos/oniguruma/master/doc/RE) 来解析文本

### 命名正则
命名正则顾名思义就是定义了名字的正则规则

logstash 内置了一些[命名正则](https://github.com/logstash-plugins/logstash-patterns-core/tree/master/patterns)

**定义**
```
DATA .*?
```
给规则`.*?`命名 DATA。

**命名正则用法**
```
%{SYNTAX:SEMANTIC:TYPE}

# 例子
# %{INT:count:int}
# %{Number:rate:float}
# %{DATA:upstream}
# %{DATA}
```
- SYNTAX: 命名正则
- SEMANTIC: 通过正则解析出来的结构化数据对应的键值，省略时表示仅匹配但不做解析
- TYPE: 通过正则解析出来的结构化数据对应的类型，省略时表示类型为字符串，当前支持的可选值为 int 和 float

**实例**

修改`logstash.conf`中的 message 字段
```
"message" => '%{INT:count:int}'
```
重启 logstash 后，终端输入`3`

可以看到输出
```
{
    "@timestamp" => 2017-04-08T03:39:40.205Z,
      "@version" => "1",
          "host" => "612edb7645b3",
         "count" => 3,
       "message" => "3",
          "tags" => []
}
```
输出中多了一个字段`count`, 其值为`3`。grok 解析并添加字段 count, 其值为整数 3

### 直接使用正则
除了使用命名正则外，我们也可以直接使用正则
```
"message" => '[0-9]+'
```
如果需要提取数据到结构化对象中，可以使用如下规则
```
(?<SEMANTIC>RULE)

# e.g
(?<count>[0-9]+)
```

配置 logstash.conf
```
"message" => '(?<count>[0-9]+)'
```
重启后输入`3`

logstash 打印
```
{
    "@timestamp" => 2017-04-08T04:17:33.670Z,
      "@version" => "1",
          "host" => "612edb7645b3",
         "count" => "3",
       "message" => "3",
          "tags" => []
}
```

## 实战
下面进行 nginx 错误日志解析

**参考日志数据**
```
2017/04/08 00:48:07 [error] 24175#24175: *573179 open() "/www/README.html" failed (2: No such file or directory), client: 220.181.51.93, server: www.baicaiyun.cn, request: "GET /README.html HTTP/1.1", host: "www.example.com"

2017/04/07 18:09:33 [error] 24174#24174: *571806 connect() failed (111: Connection refused) while connecting to upstream, client: 113.99.120.208, server: www.example.com, request: "GET /api/user/3332432/info HTTP/1.1", upstream: "http://10.46.122.16:8081/v1/ordersheet/3332432/info", host: "www.example.com", referrer: "http://www.example.com/user"
```

**分析上面数据**

- 时间：`2017/04/07 18:09:33`, 需要结构化`timestamp => 2017/04/07 18:09:33`
- 错误级别：`[error]`, 需要结构化`severity => error`
- 进程信息：`24175#24175`, 不需要结构化
- 错误信息：`*573179 open() "/www/README.html" failed (2: No such file or directory),`　需要结构化`errormessage => *573179 open() "/www/README.html" failed (2: No such file or directory)`
- 客户端 IP: `client: 220.181.51.93,`, 需要结构化`clientip => 220.181.51.93`
- 服务名：`server: www.example.com`, 需要结构化`server => www.example.com`
- 上行『可选』: `upstream: "http://10.46.122.16:8081/v1/ordersheet/3332432/info", `, 不需要结构化
- 访问域名：`host: "www.example.com"`, 需要结构化`hostname => www.example.com`
- Referrer『可选』: `, referrer: "http://www.example.com/user"`, 需要结构化`referrer => http://www.example.com/use`

**编写正则规则**
```
"message" => '(?<timestamp>%{YEAR}/%{MONTHNUM}/%{MONTHDAY} %{TIME}) \[%{LOGLEVEL:severity}\] %{POSINT}#%{NUMBER}: %{GREEDYDATA:errormessage}, client: %{IP:clientip}, server: %{DATA}, request: \"%{WORD:verb} %{GREEDYDATA:request} HTTP/%{NUMBER:httpversion}\"(?:, upstream: \"%{DATA}\")?, host: \"%{HOSTNAME:hostname}\"(?:, referrer: \"%{DATA:referrer}\")?'
```

第一条数据解析结果
```
{
        "severity" => "error",
    "errormessage" => "*573179 open() \"/www/README.html\" failed (2: No such file or directory)",
         "request" => "/README.html",
            "verb" => "GET",
         "message" => "2017/04/08 00:48:07 [error] 24175#24175: *573179 open() \"/www/README.html\" failed (2: No such file or directory), client: 220.181.51.93, server: www.baicaiyun.cn, request: \"GET /README.html HTTP/1.1\", host: \"www.example.com\"",
            "tags" => [],
        "hostname" => "www.example.com",
      "@timestamp" => 2017-04-08T04:41:52.336Z,
        "clientip" => "220.181.51.93",
        "@version" => "1",
            "host" => "612edb7645b3",
     "httpversion" => "1.1",
       "timestamp" => "2017/04/08 00:48:07"
}
```
第二条数据解析结果
```
{
        "severity" => "error",
    "errormessage" => "*571806 connect() failed (111: Connection refused) while connecting to upstream",
         "request" => "/api/user/3332432/info",
            "verb" => "GET",
         "message" => "2017/04/07 18:09:33 [error] 24174#24174: *571806 connect() failed (111: Connection refused) while connecting to upstream, client: 113.99.120.208, server: www.example.com, request: \"GET /api/user/3332432/info HTTP/1.1\", upstream: \"http://10.46.122.16:8081/v1/ordersheet/3332432/info\", host: \"www.example.com\", referrer: \"http://www.example.com/user\"",
            "tags" => [],
        "referrer" => "http://www.example.com/user",
        "hostname" => "www.example.com",
      "@timestamp" => 2017-04-08T04:48:36.250Z,
        "clientip" => "113.99.120.208",
        "@version" => "1",
            "host" => "612edb7645b3",
     "httpversion" => "1.1",
       "timestamp" => "2017/04/07 18:09:33"
}
```
