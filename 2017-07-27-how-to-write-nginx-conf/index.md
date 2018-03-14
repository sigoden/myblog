---
title: "nginx 配置从入门到精通"
slug: "nginx-how-to-write-conf"
date: 2017-07-27
tags: ["howto", nginx"]
excerpt: "nginx 可以作为静态文件服务器，可以伺服单页面应用，可以反向代理 API, 可以配置 https 等，任何一项功能都需要相应配置。如何配置合乎自己需要的 nginx 呢？"

---

## 概述

nginx 是模块化的，多种多样的模块提供了各种各样的功能。模块会对外暴露一些配置的[指令](http://nginx.org/en/docs/dirindex.html) 和[变量](http://nginx.org/en/docs/varindex.html)。
一般的 nginx 发行版只包含部分模块，具体有那些可以运行`nginx -V`查看，如果使用了没有编译在 nginx 中的模块指令，nginx 将会报错，所以使用前请确保模块已编译。

## 指令

指令控制模块的行为，分为块指令（如`server`,`stream`,`location`）和普通指令（如 `listen`, `server_name`, `return`, `if`）。

## 块指令

块指令语法：`name { ... }`; 花括号构成一个上下文，指令是有上下文限制的。如`server`需要运行在`http`上下文中，`server_name`需要运行在`server`上下文中。指令的上下文官网文档上多有标注的，如`server_name`的文档
```
Syntax:	server_name name ...;
Default: server_name "";
Context: server
```

`Context: server`表示`server_name`需要上下文`server`
像`events`和`http`不被包含在任何`{}`中，这类指令的上下文为`main`。

典型的 nginx 配置中块指令结构如下

```
...              #全局块

events {         #events 块
   ...
}

http {     #http 块
    ...    #http 全局块
    server {      #server 块
        ...       #server 全局块
        location [PATTERN] { #location 块
            ...
        }
        location [PATTERN] {
            ...
        }
    }
    server {
      ...
    }
    ...    #http 全局块
}
```

### 普通指令

普通指令语法：`name params [params];`，参数间空格隔开，句尾分号必须。 如果参数为多行字符串，需要用引号（单双均可）包起来。例如

```
log_format compression '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $bytes_sent '
                       '"$http_referer" "$http_user_agent" "$gzip_ratio"';
```
普通指令也是有上下文的，使用时请注意。而且有些指令有默认值，有时候并不出现在配置中，但是并不表示它不起作用，如`listen`，其默认值为`listen *:80 | *:8000;`, `server`块如果没有显示的配置`listen`, 将默认监听端口 80。



## 变量

nginx 变量由 $ 起头，采用下划线命名发，存储值。

可以作为指令参数
```
fastcgi_param QUERY_STRING $query_string;
```
也可以作为参数的一部分
```
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
```

### 调试变量

nginx 提供了很多变量，我们如何查看或调试这些变量呢？

- 通过 return 返回变量值

```
  location / {
     return 200 'request_uri: $request_uri
       query_string: $query_string';
  }
```

- 通过日志

```
log_format var 'request_uri: $request_uri
       query_string: $query_string';

  location / {
    access_log /path/to/var/access.log var;
    return 200;
  }
```

- 通过自定义响应头

```
  location / {
    add_header X-VAR-REQUEST-URI $request_uri;
    add_header X-VAR-QUERY-STRING $query_string;
  }
```

### 自定义变量

指令`set`可以自定义变量

```
Syntax:	set $variable value;
Default:	—
Context:	server, location, if
```

```
set $my_var "hello world"
```

但请注意，该功能是`ngx_http_rewrite_module`模块提供的，并不通用。该模块还提供了`if`,`break`,`return`等指令，这些指令让人觉得 nginx.conf 是一种程序脚本，这其实是错觉。它们仅仅是 nginx 指令而已。

## 实战

nginx 配置就是指令和变量的组合。如同知道词汇和语法还是很难写好文章，知道指令和变量还是不容易写出好的配置。写出一套好配置没什么技巧，只能多看多练了。

下面举个例子说明如何一步一步配置 nginx

### 案例介绍

#### 服务与资源

- 官网主页的静态资源，存储在 /data/wwww 目录，由一堆 html,js,css,png 等资源文件组成，其中主页文件为 home.html。
- 微信公众号页面是单页面，存储在 /data/wx 目录。
- 微信后台运行于服务器 A: 10.0.12.1 和服务器 B: 10.0.12.2 的 3000 端口。
- 域名 www.example.com 证书位于 /data/certs/www.example.com/{fullchain.pem, privkey.pem}

#### 域名绑定

- 官网主页绑定 www.example.com，其中 example.com 也绑定主页
- 微信公众号页面绑定 wx.example.com
- 微信后台绑定 api.example.com

#### 要求

- 访问域名能获取正常资源
- 静态资源要进行压缩
- 官网首页启用 https

### 配置过程

#### 静态资源服务器

本例中使用 nginx 作为静态资源服务器和发现代理服务器，涉及到的功能全部与 http 相关，而 nginx 与 http 相关的模块是`ngx_http_core_module`。
同一个端口运行多个以域名作为区分的虚拟服务，查看`ngx_http_core_module`文档
```
Syntax:	server { ... }
Default:	—
Context:	http
Sets configuration for a virtual server. There is no clear separation between IP-based (based on the IP address) and name-based (based on the “Host” request header field) virtual servers. Instead, the listen directives describe all addresses and ports that should accept connections for the server, and the server_name directive lists all server names. Example configurations are provided in the “How nginx processes a request” document.
```
可以看到`Sets configuration for a virtual server`这句，块指令 server 正是我们所需要的，
同时文档指出`server_name`用来制定服务所绑定的域名，官网主页配置如下
```
server {
  server_name www.example.com;
}
```
我们需要告诉 nginx 当收到请求时去磁盘的哪个位置获取文件，指令`root`出场了

```
server {
  server_name www.example.com;
  root /data/www;
}
```
配置完成，`nginx -t`测试语法，没问题，`nginx -s reload`让配置生效。请求`www.example.com/home.html`发现可以正常工作，直接访问`www.example.com`则 403。
但是我们希望输入`www.example.com`就能获得首页，而不用多输入一段`/home.html`。

查看`ngx_http_core_module`文档，发现没有相关功能的模块，可能是其它模块提供的功能，查找 http 以及首页 (index) 相关的模块，果然找到`ngx_http_index_module`，它只有一个指令 index

```
server {
  server_name www.example.com;
  root /data/www;
  location / {
    index home.html index.html;
  }
}
```
刷新配置，请求`www.example.com`，正常
一个简单的静态资源服务器完成啦！!!

#### https

https 可以理解为`http over ssl`, 查找 http 以及 ssl 相关模块，找到`ngx_http_ssl_module`
文档中就给出了具体的配置示例
```
worker_processes auto;

http {

    ...

    server {
        listen              443 ssl;
        keepalive_timeout   70;

        ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
        ssl_ciphers         AES128-SHA:AES256-SHA:RC4-SHA:DES-CBC3-SHA:RC4-MD5;
        ssl_certificate     /usr/local/nginx/conf/cert.pem;
        ssl_certificate_key /usr/local/nginx/conf/cert.key;
        ssl_session_cache   shared:SSL:10m;
        ssl_session_timeout 10m;

        ...
    }
```
我们可以参照这些配置，配置 https 版的 www.example.com
```
server {
  listen              443 ssl;
  keepalive_timeout   70;

  ssl_protocols       TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers         AES128-SHA:AES256-SHA:RC4-SHA:DES-CBC3-SHA:RC4-MD5;
  ssl_certificate     /data/certs/www.example.com/fullchain.pem;
  ssl_certificate_key /data/certs/www.example.com/privkey.pem;
  ssl_session_cache   shared:SSL:10m;
  ssl_session_timeout 10m;

  server_name         www.example.com;
  root /data/www;
  location / {
    index home.html index.html;
  }
}
```

#### 跳转301 

example.com 和 www.example.com 同时绑定一个服务，我们可以通过`server_name`多参数实现
```
server_name example.com www.example.com;
```
但是这样不利于统计分析（通一页面重复统计两次等），更好的做法是进行 301 跳转。
处理这类需求的模块是`ngx_http_rewrite_module`, 指令`rewrite`和`return`都满足需求，选那个呢？

这里选择`return`，因为`rewrite`要进行正则匹配，性能上逊色于`return`

```
server {
  server_name example.com;
  return 301 https://www.example.com;
}
```

####  单页面

单页面也是静态资源，其特殊之处在于路由是被一个页面接管的。`wx.example.com`请求是的首页，`wx.example.com/user`也请求的是首页，首页里的 js 会根据路径自己渲染合适的页面。

如果像之前`www.example.com`那样配置，用户在单页面里刷新浏览器就 404 了，因为 nginx 根据路径查找文件却找不到。

所有请求都返回首页也不对，有些 css，js 需要正确返回文件。而且单页面也不是一个其它页面也没有了，我可能有一个帮助页面`help.html`不是用单页面开发的，但也要正确加载啊。
我们期望 nginx 先按路径查找文件，找到了，返回找到的。找不到，很有可能是单页面的路由，返回单页面首页。

很幸运，nginx 提供了指令`try_files`处理这种情况
```
server {
  server_name wx.example.com;
  root /data/wx;
  location / {
    try_files $uri $uri/ /index.html;
  }
}

```

#### 压缩

为了减小带宽，一些静态资源一般需要压缩后传送。linux 世界有一款常用的压缩软件`gzip`, nginx 也提供了类似的模块`ngx_http_gzip_module`
由于不管是`www.example.com`还是`wx.example.com`都有静态资源，都需要压缩，所以可以直接配置在 http 块下，结合文档配置如下
```
gzip            on;
gzip_min_length 1000;
gzip_proxied    expired no-cache no-store private auth;
gzip_types      text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript;
```
根据静态资源类型调整`gzip_types`指令的参数


#### 反向代理

前面均是用 nginx 作为静态资源服务器，配置`api.example.com`则需要用到 nginx 的反向代理功能了。
与代理相关的模块是`ngx_http_proxy_module`，根据文档中的例子，得出如下配置
```
server {
  server_name api.example.com;
  location / {
    proxy_pass       http://10.0.12.1:3000;
    proxy_set_header Host      $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```
测试发现，已经可以正常工作了。但是我们的后台服务器有两台，难道要 proxy_pass 两次
```
  location / {
    proxy_pass       http://10.0.12.1:3000;
    proxy_pass       http://10.0.12.2:3000;
  }
```
可惜 nginx 不支持。
还是看文档，发现多次提到`upstream`的概念。查找`ngx_http_upstream_module`，发现正式我们需要的
```
upstream api {
  server 10.0.12.1:3000;
  server 10.0.12.2:3000;
}

server {
  server_name api.example.com;
  location / {
    proxy_pass       http://api;
    proxy_set_header Host      $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### 小结

案例到这儿就分析完了，思路就是根据需求，找到可能提供这个需求的模块。例如需要权限控制，有模块`ngx_http_auth_basic_module`；需要限制流量，找模块`ngx_http_limit_req_module`。
进入模块文档，一般复杂一点的模块都会提供一些配置范例，可以多参考。然后查找相关指令，编写配置，测试。

## 结论

到这儿大家应该对 nginx 配置有了一个直观的认知和清晰的构造思路。有时间多分析，多练习。完成功能只是起步，nginx 中有大量的指令是用来性能调优，安全强化的，配置时也请多注意。
模块提供了
