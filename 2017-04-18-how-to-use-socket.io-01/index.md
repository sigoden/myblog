---
title: "socket.io 系列一：介绍"
date: "2017-04-18"
slug: "socket-iozhi-yi-jie-shao"
tags: ["nodejs", "socket.io", "javascript"]
excerpt: "socket.io 提供了基于事件的实时双向通讯，本文将对其进行详细介绍"

---

## 历史
Web 端与服务器间的实时数据传输的是一个很重要的需求，但最早只能通过 AJAX 轮询询实现。在 WebSocket 标准没有推出之前，AJAX 轮询是唯一可行的方式（通过 Flash 浏览器也可以，但这里不做讨论）。AJAX 轮询原理是设置定时器，定时通过 AJAX 同步服务器数据。这种方式存在延时且对服务端造成很大负载。直到 2011 年，IETF 才标准化 WebSocket——一种基于 TCP 套接字进行收发数据的协议。现如今主流浏览器均已支持 WebSocket。
![浏览器 WebSocket 支持状况](https://cdn.sigoden.com/browser-websocket-support.png)

socket.io 将数据传输部分独立出来形成了 [engine.io](https://github.com/socketio/engine.io.git), engine.io 对 WebSocket 和 AJAX 轮询进行封装，形成一套 API, 屏蔽了细节差异和兼容性问题，实现了跨浏览器 / 跨设备进行双向数据。

> socket.io 对 engine.io 不是必须的，你也可以实现自己的 engine.io，通过`server.bind`绑定


## 应用

- 实时数据分析展示（报表，日志）
- 即时通讯、聊天，
- 二进制流（图片，音乐，视频）传输
- 多人协同编辑
- 即时消息推送

## 类似技术

- AJAX 轮询：基于 XMLHttpRequest 的 AJAX 轮询
- AJAX 长轮询：类似轮询，服务器在客户端请求后不返回响应，直到有数据需要传到客户端，传完数据后客户端再发起新的请求。缺点是要额外传输的 HTTP 头，保持住请求不响应也需要一些额外工作。
- HTTP 流：与 AJAX 长轮询类似，服务端响应会带上 HTTP 头：Transfer-Encoding: chunked，返回完数据到客户端后客户端也不需要发起新的请求，缺点是各个 chunk 之间的数据难以识别和处理。
- 插件：类似 Flash,Silverlight, 作为插件越来越被主流浏览器和用户排斥

下面就不同角度对各技术进行分析

1. 单向 / 双向

- 单向：AJAX 轮询，AJAX 长轮询，HTTP 流
- 双向：WebSocket, 插件

2. 延时

`WebSocket < 插件 < HTTP 流 < AJAX 长轮询 < AJAX 轮询`

3. 效率

`插件 > WebSocket > HTTP 流 > AJAX 长轮询 > AJAX 轮询`

4. 移动端支持

WebSocket: 基本均支持
HTTP 流，AJAX 长轮询，AJAX 轮询：基本均支持
插件：基本不支持

5. 开发或设置难易程度

`WebSocket < AJAX 轮询 < 插件 < AJAX 长轮询，HTTP 流`

## 结论

socket.io 封装了 WebSocket, 不支持 WebSocket 的情况还提供了降级 AJAX 轮询，功能完备，设计优雅，是开发实时双向通讯的不二手段。
