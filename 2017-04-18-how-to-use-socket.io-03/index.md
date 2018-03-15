---
title: "socket.io 系列三：深入学习"
date: "2017-04-18"
slug: "socket-iozhi-san-shen-ru-xue-xi"
tags: ["howto", "socket.io", "javascript"]
excerpt: "socket.io 提供了基于事件的实时双向通讯，本文将对其进行详细介绍(三)"

---

## 静态文件

socket.io 默认情况下会通过 socket.io-client 包提供 socket.io.min.js 和 socket.io.js.map 下载
运行实例 app.js

```
let app = require('http').createServer()
let io = require('socket.io')(app)

app.listen(3000);
```
浏览器访问`http://localhost:3000/socket.io/socket.io.js`可以加载压缩的源码，访问`http://localhost:3000/socket.io/socket.io.js.map`加载 sourcemap

我们可以改变这种行为

### 禁用 socket.io.js 下载

方法 1: 实例化时传入控制参数`serveClient`值 false

```
let io = require('socket.io')(app, {
  serveClient: false
})

```
方法 2: 调用函数`serverClient`

```
let app = require('http').createServer()
let io = require('socket.io')()
io.serveClient(false)
io.listen(app) // 或者 io.attach(app)
```

> 如果在调用函数前服务已绑定 http.Server, 该方法将不起作用

禁用后再次访问将提示`{"code":0,"message":"Transport unknown"}`

### 修改静态文件路径

socket.io.js 路径可以改变，其默认路径为 /socket.io。

实例化时传参

```
let io = require('socket.io')(app, {
  path: '/io'
})
```

调用函数`path`

```
let app = require('http').createServer()
let io = require('socket.io')()
io.path('/io')
io.listen(app)
```

> 如果在调用函数前服务已绑定 http.Server, 该方法将不起作用

## 安全策略

socket.io 提供了两种安全策略

### allowRequest

函数`allowRequest`有两个参数，第一个参数为收到的握手包 (http.request) 对象，作为判断依据，success), err 是错误对象，success 为 boolean, false 表示阻止建立连接

前端请求带上 token

```
let socket = io('http://localhost:3000?token=abc')
socket.on('connect', () => {
  console.log('connect')
})
socket.on('connect_error', err => {
  socket.disconnect()
  console.log('connect_error', err)
})
```

后端 allowRequest 根据 token 判断是否继续

```
let app = require('http').createServer()
let io = require('socket.io')(app, {
  allowRequest: (req, cb) => {
    if (req._query && req._query.token === 'abc') return cb(null, true)
    cb(null, false)
  }
});
```
### origins

可以对源进行限制

1. 实例化时限制源

```
let app = require('http').createServer()
let io = require('socket.io')(app, {
  origins: 'http://localhost:3000'
})
```


2. origins 函数设置源

origins 函数有两种形式
origins(string):  设置运行的源
origins(string, fn(err, success)): 通过函数判断源是否允许

```
io.origins('http://localhost:*')

io.origins((origin, cb) => {
  if (origin === 'http://localhost:3000/') return cb(null, true)
  cb(null, false)
})
```

## 名称空间

名称空间用来对服务端 / 客户端的连接隔离，有些地方，也称呼名称空间 (namespace) 为通道 (channel)。下面举例对其意义进行说明

我们需要实现一个协同应用，这个应用有两个功能：

- 协同编辑：多个用户可以同时编辑一个文档
- 消息：用户间可以发送消息

用 socket.io 实现这个应用，有如下几种形式

- 完全独立：协同编辑有一个独立服务 edit.socket.test, 消息系统一个独立服务 message.socket.test

```
let editSocket = io('edit.socket.test')
let messageSocket = io('message.socket.test')
```

- 名称空间：只运行一个独立服务，通过名称空间进行隔离

```
let app = require('http').createServer()
let io = require('socket.io')(app)
let editServer = io.of('/edit')
let messsageServer = io.of('/message')
editServer.on('connection', socket => {
  // 编辑相关
})
messsageServer.on('connection', socket => {
  / 消息相关
})

let editSocket = io('socket.test/edit')
let messageSocket = io('socket.test/message')
```

- 事件名约定：通过为事件名添加进行隔离

```
let app = require('http').createServer()
let io = require('socket.io')(app)

io.on('connection', socket => {
  // 编辑相关
  io.emit('edit:test')
  io.on('edit:test', data => {

  })
  // 消息相关
  io.emit('message:test')
  io.on('message:test', data => {

  })
}
```

通过事件名约定程序的侵入性太大，不利于拆分和重组，不推荐。 而完全独立的模式需要使用两个 socket 连接，即浪费浏览器允许的并发连接数，又更多消耗服务器资源。使用名称空间即能实现很好的隔离，又不会对资源造成浪费。


### 默认名称空间

socket.io 实例化时自动绑定路径为`/`的名称空间

```
let app = require('http').createServer()
let io = require('socket.io')(app)

io.sockets // io.of('/').sockets
io.emit // 代理 io.of('/').emit, 类似函数有'to', 'in', 'use', 'send', 'write', 'clients', 'compress'
```

## 中间件

socket.io 的名空间通过 use 注册中间件，中间件在客户端与服务端建立连接成功后，connet 事件派发前调用**一次**。


利用中间件数据校验
```
io.use((socket, next) => {
  if (socket.request.headers.cookie) return next()
  next(new Error('Authentication error'))
})
```

利用中间件提取或转换数据
```
io.use((socket, next) => {
  getInfo(socket.request.query.id, (err, data) => {
    if (err) return next(err)
	socket.custom = data
	next()
  })
})
```

### 与 allowRequest 对比

allowRequest 可以进行一些校验，提取，为什么还要需要中间件？

1. allowRequest 传入的 http.request 实例，而中间件出入数据 socket 实例，socket 实例包含 request 实例，且有更多信息
2. 中间件直接支持多个异步流程嵌套，而 allowRequest 需要自己实现

### 与 connection 事件对比
connection 事件也传入 socket, 也可以进行数验，提取，为什么还要需要中间件？

1. 中间件直接支持多个异步流程嵌套，而 allowRequest 需要自己实现
2. 中间件成功后到 connection 事件发送成功前，socket.io 还做了一些工作，比如把 socket 实例添加到 connected 对象中，加入聊天室等。如果因为权限中断连接，在中间件中处理更省资源。


## 聊天室

聊天室是对当前连接的 socket 集合根据特定规则进行归组，方便群发消息。可以类比 QQ 群的概率。

```
socket.join('room name') // 进入
socket.leave('room name') // 退出
```

```
io.to('some room').emit('some event') // io.to 与 io.in 同义，向某个聊天室的所有成员发送消息

```

### 默认聊天室
每个 socket 在连接成功后会自动创建一个默认个聊天室，这个聊天室的名字是当前 socket 的 id, 可以通过默认聊天室实现向特定用户发送消息

```
socket.on('say to someone', (id, msg) => {
  socket.broadcast.to(id).emit('my message', msg)
})
```

## 消息发送

### 应答消息

普通消息不需要回应，而应答消息提供了应答机制

```
io.on('connection', socket => {
  socket.emit('an event', { some: 'data' }) // 普通消息

  socket.emit('ferret', 'tobi', function (data) { // 应答消息
    console.log(data); // data will be 'woot'
  })
})
```

```
socket.on('ferret', (name, fn) => {
  fn('woot')
})
```

### 压缩

`socket.compress(true)`启用压缩，调用后当前连接的所有数据在传递给客户端前都会进行压缩

### volatile 标志

socket.io 在正常情况下对发送的消息进行追踪，确保消息发送成功，而设置 volatile 后发送消息，socket.io 不会对消息追踪，消息可能丢失

### 分类
```
// 客户端发送消息
socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

// 向所有连接的客户端（除了自己）发送消息
socket.broadcast.emit('broadcast', 'hello friends!');

// 向 game 聊天室发送消息，自己不算
socket.to('game').emit('nice game', "let's play a game");

// 同时向 game1 和 game2 聊天室发送消息，自己不算
socket.to('game1').to('game2').emit('nice game', "let's play a game (too)");

// 向 game 聊天室的所有人发送消息
io.in('game').emit('big-announcement', 'the game will start soon');

// 发送消息到<socketid>客户端
socket.to(<socketid>).emit('hey', 'I just met you');

// 发送应答消息
socket.emit('question', 'do you think so?', function (answer) {});
```
