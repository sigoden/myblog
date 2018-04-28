---
title: "基于 Htte 的 API 自动化测试"
slug: "how-to-automate-testing-api-with-htte"
date: "2018-04-28"
tags: ["howto", "htte", "api-testing", "automation-testing"]
excerpt: "本文将以一款超简单的博客应用为例子，介绍如何使用 Htte 进行 API 接口的自动化测试"

---

本文将以一款超简单的博客应用为例子，介绍如何使用 Htte 进行 API 接口的自动化测试。

## Htte 介绍

[Htte](https://github.com/sigoden/htte) 是一款自动化测试框架。它允许你使用 YAML 编写测试，不需要编写代码。 难度低，上手快。

编写一个测试就是罗列出请求数据以及预期的响应数据。htte 会自动为你生成请求，并验证响应数据是否匹配预期。

它提供插件，没有什么数据是生成和表示不了的，没有什么数据是无法校验和比对的，没有什么场景是测试不了。

接口自动化测试中，测试中使用来自其它测试的数据一直是难言的痛。Postman 通过环境变量处理这个问题，繁琐又容易出错，Htte 创新独到
地采用会话和路径引用数据处理这个问题，安全而简便。

Htte 是一款优秀的接口自动化测试工具，值得大家一试。

## 安装

使用 npm 安装 htte 命令行:

```
npm i -g htte
```

## 接口详情

有这样一款超简单的博客应用。它只有四个接口。

- 登录接口

```
功能: 用户登录
请求路径: localhost:3000/login
请求方法: POST
请求头: { "Content-Type": "application/json" }
请求数据: {"username": "john", "password": "johnsblog"}
响应:
  - 状况: 用户名和密码正确
    响应状态码： 200
    响应数据: {"name": "john", "token": "..."}
  - 状况: 用户名或密码不正确
    响应状态码： 401
    响应数据: {"errcode": 11001, "message": "invalid username or password"}
```

- 添加博文

```
功能: 添加博文
请求路径: localhost:3000/articles
请求方法: POST
请求头: { "Content-Type": "application/json", "Authorization": "Bearer ..." }
请求数据: >
  {
    "title": "How to use htte",
    "content": "htte is ....",
    "tags": ["howto", "htte"]
  }
响应:
  - 状况: 添加成功
    响应状态码： 200
    响应数据: >
      {
        "title": "How to use htte",
        "slug": "how-to-use-htte-A43bcF",
        "content": "htte is ....",
        "tags": ["howto", "htte"],
        "createdAt": "2018-04-28T07:35:08.471Z"
      }
```

- 编辑博文

```
功能: 编辑博文
请求路径: localhost:3000/article/how-to-use-htte-A43b
请求方法: PUT
请求头: { "Content-Type": "application/json", "Authorization": "Bearer ..." }
请求数据: >
  {
    "title": "How to create htte plugin",
    "content": "htte plugin is ....",
    "tags": ["howto", "htte", "plugin"]
  }
响应:
  - 状况: 编辑成功
    响应状态码： 200
    响应数据: >
      {
        "title": "How to use htte plugin",
        "slug": "how-to-use-htte-A43b",
        "content": "htte plugin is ....",
        "tags": ["howto", "htte", "plugin"],
        "createdAt": "2018-04-28T07:35:08.471Z"
      }
```

- 获取博文列表

```
功能: 获取所有博文
请求路径: localhost:3000/articles
请求方法: GET
请求头: { "Content-Type": "application/json", "Authorization": "Bearer ..." }
querystring: tag=howto
响应:
  - 状况: 成功
    响应状态码： 200
    响应数据: 
      {
        "articlesCount": 1,
        "articles": [
          {
            "title": "How to use htte plugin",
            "slug": "how-to-use-htte-A43b",
            "content": "htte plugin is ....",
            "tags": ["howto", "htte", "plugin"],
            "createdAt": "2018-04-28T07:35:08.471Z"
          }
        ]
      }
```

## 测试接口

添加配置文件 `.htte.yaml`，描述接口

```yaml
url: http://localhost:3000
type: json # 使用 json 解压缩请求响应数据
apis:
  login:
    method: post
    uri: /login
  createArticle:
    method: post
    uri: /articles
  updateArticle:
    method: put
    uri: /article/{slug}
  listArticles: /articles
```

添加测试文件 `blog.yaml`，编写测试。

### 测试登录失败

```yaml
units:
  - describe: 登录失败
    api: login
    req:
      body:
        username: john
        password: johnblog
    res:
      status: 401
      body:
        errcode: 11001
        message: !@exist
```

`describe` 描述测试的目的，该字段会在最好的测试报告中呈现。

`api` 描述被测试的接口，该字段关联配置文件中的接口定义。

`req` 定义请求数据, `body`下的数据会封装到请求体 `{"username": "john", "password": "johnblog"}`。

`res` 期望响应数据。如果与实际响应数据不匹配，会导致测试不通过。

当 htte 载入这段测试代码，会构造请求，也就是会往 `http://localhost:3000/login` 发送 `post` 请求，
有请求头 `{"Content-Type": "application/json"}`, 及请求体 `{"username": "john", "password": "johnblog"}`。
当服务端响应后，会对响应的数据作如下断言

- 响应状态码为 401
- 响应体是一个对象
- 响应体对象有且仅有两个属性 `errcode` 和 `message`
- 响应体对象的 `errcode` 属性值为 11001
- 响应体对象的 `message` 属性值为 `invalid username or password`

所以断言全部通过，测试才会通过。如响应状态码不为 401 或者响应体中多了其它其它字段，都是不完全匹配，会导致测试失败。

### 测试登录成功

```yaml
  - describe: 登录成功
    api: login
    name: johnLogin
    req:
      body:
        username: john
        password: johnsblog
    res:
      body:
        username: john
        token: !@exist
```

`name` 定义测试名称，后续测试可以通过该名称访问该 测试数据，比如响应的 `token` 值。

`res` 中省略了 `status`，并不代表不检查状态码了。对于这种情况 htte 会检查是否状态码在 200-299 范围内。

`token` 的值是变动的，我们检查其具体值。所以使用 YAML 标签 `!@exist` 进行一种特殊的检查。其验证 `token` 字段存在，不校验其具体值。

`!@exist` 由 htte 插件提供。在只关注字段有无而不在意值的情况下使用。

### 测试添加博文

```yaml
  - describe: 添加博文成功
    api: createArticle
    name: articleUsehtte
    req:
      headers: 
        Authorization: !$concat ['Bearer', ' ', !$query $$johnLogin.res.body.token]
      body:
        title: How to use htte
        content: htte is http automation testing tool
        tags: 
          - howto
          - htte
    res:
      body:
        title: How to use htte
        slug: !@regexp /^how-to-use-htte/
        content: htte is http automation testing tool
        tags: 
          - howto
          - htte
        createdAt: !@exist
```

`headers` 描述请求头。它将向发送的请求头中追加 `Authorization` 头。

添加博文接口会进行 JWT 权限校验，因此我们需要添加 `Authorization` 头，提供登录 `token`。

这个 `token` 可以从测试 `johnLogin` 中获取。我们通过标签 `!$query` 引用这个 `token` 值。

> htte 会通过会话记录运行过的测试的请求和响应数据，你可以这种方式获取位于你前面的测试的数据。不需要预先定义，只需要定位（访问路径）。

然后使用标签 `!$concat` 拼接 `Bearer ` 和 `token` 值得到 `Authorization` 的具体值。

`slug` 表示博文的访问链接，通过 title 拼接一个 4 个字符的随机字符串生成。它也不是一个具体值，所以我们使用 `!@regexp` 进行正这而匹配验证。

> 大多情况下，测试的请求数据及预期响应数据是可以给定的，但总免不了会碰到一些特殊状况，这是就需要使用插件了。htte 许多内置插件，它们
> 应该足够应对绝大多数常见了。如果碰到无法处理的情况，可以发 issue 或编写插件。

### 测试编辑博文

```yaml
  - describe: 编辑博文成功
    api: updateArticle
    req:
      headers: 
        Authorization: !$concat ['Bearer', ' ', !$query $$johnLogin.res.body.token]
      params:
        slug: !$query $$articleUsehtte.res.body.slug
    res:
      body:
        title: How to use htte plugin
        slug: !@query $$$req.params.slug
        content: htte plugin is flexiabe
        tags: 
         - howto
         - htte
         - plugin
        createdAt: 2018-04-28T07:35:08.471Z
```

`params` 描述路径参数，该测试的请求路径是 `/article/{slug}`，带有路径参数 slug,
发送请求前 htte 会将替换成 `params` 中对应的值，最终的请求路径是 `/article/how-to-use-htte-A43bcF`

`!@query` 标签检验响应值是否某个引用值相等，用来判断更新文章或 slug 是否改变。

### 测试获取博文列表

#### 获取我的所有博文
```yaml
  - describe: 获取我的所有博文
    api: listArticles
    req:
      headers: 
        Authorization: !$concat ['Bearer', ' ', !$query $$johnLogin.res.body.token]
    res:
      body:
        articlesCount: !@exist
        articles: !@array
          0: 
            title: How to use htte plugin
            slug: !@regexp /^how-to-use-htte/
            content: htte plugin is flexiabe
            tags: 
              - howto
              - htte
              - plugin
            createdAt: !@exist
```

`!@array` 要特别注意。Htte 常规状态下比对数组时，会先比对元素个数，在逐一比对个元素。
而 `articles` 可能是一个长度不固定的数组，，这种状况下进行常规比对没有意义。
使用 `!@array` 自定义数组比对行为，使其仅比对特定的元素，比如该测试中，就表示仅对第一个元素进行比对，忽略其它元素。
如果该元素匹配，则测试通过。

#### 通过标签筛选我的博文

```yaml
  - describe: 通过标签赛选我的博文
    api: listArticles
    req:
      headers: 
        Authorization: !$concat ['Bearer', ' ', !$query $$johnLogin.res.body.token]
      query:
        tag: howto
    res:
      body:
        articlesCount: !@exist
        articles: !@array
          0: 
            title: How to use htte plugin
            slug: !@regexp /^how-to-use-htte/
            content: htte plugin is flexiabe
            tags: 
              - howto
              - htte
              - plugin
            createdAt: !@exist
```

`query` 描述 querystring, 测时的 url 将变成 `http://localhost:3000/articles?tag=howto`。

## 命令行

保证 Web 可用的情况下，在文件 `.htte.yaml` 和 `blog.yaml` 所在的目录，执行命令 `htte`, htte 会逐一执行测试。
并打印测试执行的结果。

一些 htte 命令行有些实用技巧：

- 某个测试失败时暂停执行

```
htte --bail 
```

- 从上次失败的地方开始执行, 适合接口调试

```
htte --bail --amend
```

- 仅运行指定测试

```
htte --unit blog-articleUsehtte --shot
```

- 显示调试信息，将同步打印请求响应数据

```
htte --debug
```

## 结论

通过这个仅仅 4 接口的博客应用接口测试案例，你应该很很熟悉 Htte 了，就是这么简单。
Htte 自动生成数据，发送请求，比对响应数据，编排测试用例并逐一执行，打印报告。

所谓测试就是使用 YAML 描述接口的请求和响应。对于描述不了的极少部分场景提供了插件。
即享有描述性策略编写测试的优越性，又持有插件带来的灵活性。

项目地址: [https://github.com/sigoden/htte](https://github.com/sigoden/htte)
