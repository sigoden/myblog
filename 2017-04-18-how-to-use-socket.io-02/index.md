---
title: "socket.io 系列二：基本应用"
date: "2017-04-18"
slug: "socket-iozhi-er-ji-ben-ying-yong"
tags: ["howto", "socket.io", "javascript"]
excerpt: "socket.io 提供了基于事件的实时双向通讯，本文将对其进行详细(二)"

---

## 服务端与客户端连接

socket.io 同时提供了服务端和客户端的 API

服务端 socket.io 必须绑定一个 http.Server 实例

## 绑定 http.Server

1. 隐式绑定

通过实例化时传入端口或实例化后调用`listen`或`attach`函数进行隐式绑定。socket.io 内部实例化并监听 http.Server

- 实例化时传入端口

```
let io = require('socket.io')(3000)
```

- 直接通过`listen`或`attach`函数绑定。`listen`与`attach`同义

```
let io = require('socket.io')
io.listen(3000) // io.attach(3000)
```

2. 显示绑定

可以手动指定 http.Server

- 实例化时绑定

```
let server = require('http').Server();
let io = require('socket.io')(server)

server.listen(3000)
```

- 通过`listen`或`attach`绑定

```
let server = require('http').Server();
let io = require('socket.io')()

io.listen(server) // io.attach(server)

server.listen(3000)
```

- 可以绑定 express 或 koa 等 http 框架

**express**
```
let app = require('express')
let server = require('http').Server(app)
let io = require('socket.io')(server)

app.listen(3000)
```

**koa**
```
let app = require('koa')()
let server = require('http').Server(app.callback())

let io = require('socket.io')(server)

app.listen(3000)
```

## 监听连接状态

当服务器端与客户端连接成功时，服务端会监听到`connection`和`connect`事件 (connection 与 connect 同义）, 客户端会监听到`connect`事件，断开连接时服务端的对应到客户端的 socket 与客户端均会均会监听到`disconnect`事件

服务端代码

```
let server = require('http').Server()
let io = require('socket.io')(server)

server.listen(3000);
io.on('connection', socket => {
  console.log('connect')
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
  socket.disconnect()
})
```
运行后打印

```
connect
disconnect
```


客户端代码
```
let socket = io('http://localhost:3000')
socket.on('connect', () => {
  console.log('connect')
})
socket.on('disconnect', () => {
  console.log('disconnect')
})
```
运行后打印
```
connect
disconnect
```

## 传输数据

服务器与客户端的 socket 是一个关联的 EventEmitter 对象，客户端 socket 派发的事件可以通以被服务端的 socket 接收，服务器端 socket 派发的事件也可以被客户端接受。基于这种机制，可以实现双向交流。

现在模拟这样一种情况：客户端不停发送随机数，当随机数大于 0.95 时，服务端延时 1s 后向客户端发送警告以及警告次数


服务端代码

```
let server = require('http').Server()
let io = require('socket.io')(server)

server.listen(3000);
io.on('connection', socket => {
  socket.on('random', value => {
    console.log(value)
    if (value > 0.95) {
      if (typeof socket.warning === 'undefined') socket.warning = 0
      setTimeout(() => {
        socket.emit('warn', ++socket.warning)
      }, 1000)
    }
  })
})
```

socket 对象可以用来存储状态信息和自定义数据，如`socket.warning`

客户端代码

```
let socket = io('http://localhost:3000')
let interval = setInterval(() => {
  socket.emit('random', Math.random())
}, 500)
socket.on('warn', count => {
  console.log('warning count: ' + count)
})
socket.on('disconnect', () => {
  clearInterval(interval)
})
```

## 传输流

socket.io 可以处理流

服务端代码
```
io.on('connection', function (socket) {
  let stream = ss.createStream()
  ss(socket).emit('script', stream)
  fs.createReadStream(__filename).pipe(stream)
})
```

客户端代码
```
let socket = io('http://localhost:3000')
ss(socket).on('script', stream => {
  let buffer = ''
  stream.on('data', data => {
    buffer += data.toString()
  })
  stream.on('end', () => {
    console.log(buffer)
  })
})
```

