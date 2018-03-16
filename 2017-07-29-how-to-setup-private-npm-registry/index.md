---
title: "使用 verdaccio 搭建 npm 私有仓储"
date: "2017-07-29"
slug: "verdaccio-private-npm-registry"
tags: ["howto", "registry", "npm"]
excerpt: "私有 npm 仓储可以保护企业的内部库，可以通过缓存加快企业内部包的安装。如何搭建一套私有 npm 仓储呢？"

---

本文将讲述如何使用 Verdaccio  搭建私有 npm 仓储。

## 入门

verdaccio 是个发布在 npm 上的命令行工具。可以通过 npm 直接下载安装

```
npm i -g verdaccio
```

verdaccio 在文件系统上存储数据，没有额外依赖，而且提供了一套默认配置，我们可以直接启动仓储服务

```
$ verdaccio

 warn --- config file  - /home/ubuntu/.config/verdaccio/config.yaml
 warn --- http address - http://localhost:4873/ - verdaccio/2.3.2
```
终端上的日志显示了默认配置文件路径和 verdaccio 工作的地址端口

浏览器打开`http://localhost:4873/` ，页面如下

![verdaccio](https://cdn.sigoden.com/verdaccio-home-default.png)

恭喜！仓储搭建并运行成功。

## 配置

- storage: 设置托管或缓存包的存放目录

- ~~ users: 权限控制，已准备弃用~~
- auth: 权限控制
    - htpasswd: 启用 htpasswd 插件管理权限
        - file: 制定 htpasswd 文件路径，htpasswd 中存储者用户名和加密过的秘钥
        - max_users: 最多允许注册用户数
- uplinks: 设置外部仓储，如果 verdaccio 找不到请求的包（非 verdaccio 托管），就会查找外部仓储。常见的有
    - {name}: 外部仓储名称
        - url: 访问路径
        - timeout: 超时
        - maxage: 默认值 2m，2m 钟内不会就同样的请求访问外部仓储
        - fail_timeout: 如果外部访问失败，在多长时间内不回重试
        - headers: 添加自定义 http 头当外部仓储访问请求中，例如`authorization: "Basic YourBase64EncodedCredentials=="`
        - cache: 是否启用缓存，默认启用。

    常用仓储有
    ```
    npmjs:
      url: https://registry.npmjs.org
    yarnjs:
      url: https://registry.yarnpkg.com
    cnpmjs:
      url: https://registry.npm.taobao.org
    ```

- packages: 包访问或发布控制
    - {regexp}: 包名匹配正则。
        - access: 访问控制，可选值有`$all`（用户不限制）, `$anonymous`（用户不限制）, `$authenticated`（所有登录用户）,  `username`( 用户名，需指定具体用户，可指定多个用户，用户间空格隔开，如 secret super-secret-area ultra-secret-area)。~~尽管`@all`, `@anonymous`, `all`, `undefined`, `anonymous`目前仍然可以使用，但已准备废弃。~~
        - ~~allow_access: access 的别称，已准备弃用。~~
        - publish: 发布控制，配置请参考 access
        - ~~allow_publish: publish 的别称，已准备弃用。~~
        - proxy: 代理控制，设置的值必选现在 uplinks 中定义。
        - ~~proxy_access: proxy 的别称，已准备弃用。~~

    常用的包名正则有：

    ```
    **         # 匹配任意包
    @*/*       # 匹配任意 scope 包
    @npmuser/* # 匹配 scope 为 npmuser 的包
    npmuser-*  # 匹配包名有 npmuser- 前缀的包
    ```
    包名正则规范通 gitignore 一致，verdaccio 内部使用`minimatch`实现的，如果需要书写更复杂的正则，可以参考 [minimatch](https://www.npmjs.com/package/minimatch) 文档。

- web: 前端展示页面控制
    - title: 设置页面标题
    - logo: 指定 logo 图片文件路径

- publish: 发布包是的全局配置
    - allow_offline: 在外部仓储离线时是否允许发布。在发布包是 verdaccio 会检查依赖包有效性，这个过程中需要访问外部仓储。

- url_prefix: 设置资源文件路径前缀。默认不需要设置，但如果使用 nginx 代理并改写了请求路径，就需要指定了。

- listen: 设置服务运行地址端口，默认为 http://localhost:4873

    支持的配置有：
    ```
    localhost:4873            # default value
    http://localhost:4873     # same thing
    0.0.0.0:4873              # listen on all addresses (INADDR_ANY)
    https://example.org:4873  # if you want to use https
    [::1]:4873                # ipv6
    unix:/tmp/verdaccio.sock    # unix socket
    ```
- https: HTTPS 证书配置
    - key: path/to/server.key
    - cert: path/to/server.crt
    - ca: path/to/server.pem

- log: 日志控制
    - type: file, stdout, stderr, 其中 stdout 需要同时指定 path
    - level: trace | debug | info | http (default) | warn | error | fatal
    - format: json | pretty | pretty-timestamped

- http_proxy: 设置以 http 形式访问外部仓储时使用的代理
- https_proxy: 设置以 https 形式访问外部仓储时使用的代理
- no_proxy: 不使用代理的请求路径

- max_body_size: 请求时上传的 json 允许的最大值

- notify: 当有包发布成功时，verdaccio 会发送通知。通知实际上是一次 http 请求。支持配置多套通知
    - method: 请求方法 GET,POST 等 HTTP Method
    - packagePattern: 包匹配正则， 这儿为 js 正则，仅当发布的包名匹配正则时才发送通知
    - packagePatternFlags: js 正则标志位，如`i`忽略大小写
    - headers: 自定义请求头
    - endpoint: 请求地址
    - content: handlebar 格式 html 模板，可以使用变量详见 [Package Metadata](https://github.com/npm/registry/blob/master/docs/responses/package-metadata.md)

## 演示

我们先通过 verdaccio 熟悉一下 npm 包发布流程

### 公开包

- 项目初始化

```
npm init -f
```

- 编写包代码

这个包只有一个 index.js 文件
```
module.exports = function () {
  return 'verdaccio works'
}
```

- 注册并登录仓储

```
npm adduser --registry  http://localhost:4873

```
输入用户名，密码和邮箱创建用户

- 发布包

```
npm publish --registry http://localhost:4873
```
刷新页面可以看到我们提交的包出现了

- 测试安装

```
npm install <package-name> --registry http://localhost:4873
```
成功，如果我们退出登录状态后再安装呢

```
npm logout --registry http://localhost:4873
npm install <package-name> --registry http://localhost:4873
```
也是成功的，这说明 verdaccio 提供的默认配置中所有发布的包都被公开，所有人（包括未登录用户）均可见。

### 私有包

现在配置`org-`前缀的包全部私有

只需在配置文件 config.yml 中 package 段添加配置
```
  'org-*':
    access: $authenticated
    publish: $authenticated
    proxy: npmjs
```

这里我们配置了所有`org-`前缀的包只有注册用户才能访问和发布。

你也可以对 publish 做进一步限制，只有 npmuser 用户才能发布
```
  'org-*':
    access: $authenticated
    publish: npmuser
    proxy: npmjs
```

注意修改配置后要重启 verdaccio


### scope 包

其实加前缀并不是一种很好组织包的方式，npm 提供了更好的名称空间策略 scope

scope 包包名格式：@scope-name/pkg-name

初始化包时指定 scope

```
npm init --scope org
```

我们可以为 scope 绑定一个仓储
```
npm login --registry=http://reg.example.com --scope=@org
npm config set @org:registry http://reg.example.com
```
这样凡是碰到 scope 为 @org 的包，npm 将自动切换作业仓储到 scope 绑定的仓储，这提供了一种多仓储策略。

scope 私有包配置
```
  '@org/*':
    access: $authenticated
    publish: $authenticated
    proxy: npmjs
```

## 结论

使用 verdaccio，我们可以很容易就搭建一套私有 npm 仓储，并能灵活的进行访问控制。
