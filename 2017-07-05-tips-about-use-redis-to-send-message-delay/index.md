---
title: "Redis 延时推送消息"
date: "2017-07-05"
slug: "redisyan-shi-tui-song-xiao-xi"
tags: ["tips", "nodejs", "redis"]
excerpt: "常常碰到这样的需求：预约前一个小时向短信通知用户不要错过消费，订单超过 24 小时而没有进一步操作自动取消。这类问题可以和定时消息一起归类到延时消息里。可以通过 Redis 的键空间通知实现类似需求"

---

## 介绍

键空间通知使得客户端可以通过订阅频道或模式， 来接收那些以某种方式改动 了 Redis 数据集的事件。
比如说，对 0 号数据库的键 mykey 过期时，系统将分发两条消息， 相当于执行以下两个 PUBLISH 命令：
```
PUBLISH __keyspace@0__:mykey expired
PUBLISH __keyevent@0__:expired mykey
```
订阅第一个频道`__keyspace@0__:mykey` 可以接收 0 号数据库中所有修改键 mykey 的事件， 而订阅第二个频道 `__keyevent@0__:expired `则可以接收 0 号数据库中所有执行 expired 命令的键。 以 keyspace 为前缀的频道被称为键空间通知（key-space notification）， 而以 keyevent 为前缀的频道则被称为键事件通知（key-event notification）。

## 配置

因为开启键空间通知功能需要消耗一些 CPU ，所以在默认配置下， 该功能处于关闭状态。可以通过修改 redis.conf 文件，或者直接使用 CONFIG SET 命令来开启或关闭键空间通知功能：

- 当 notify-keyspace-events 选项的参数为空字符串时，功能关闭。
- 另一方面，当参数不是空字符串时，功能开启。

notify-keyspace-events 字符选项

- K: 键空间通知，所有通知以 __keyspace@<db>__ 为前缀
- E: 键事件通知，所有通知以 __keyevent@<db>__ 为前缀
- g: DEL 、 EXPIRE 、 RENAME 等类型无关的通用命令的通知
- $: 字符串命令的通知
- l: 列表命令的通知
- s: 集合命令的通知
- h: 哈希命令的通知
- z: 有序集合命令的通知
- x: 过期事件：每当有过期键被删除时发送
- e: 驱逐 (evict) 事件：每当有键因为 maxmemory 政策而被删除时发送
- A: 参数 g$lshzxe 的别名


输入的参数中至少要有一个 K 或者 E ， 否则的话， 不管其余的参数是什么， 都不会有任何通知被分发。举个例子， 如果只想订阅键空间中和字符串过期的通知， 那么参数就应该设为 K$e ， 诸如此类。将参数设为字符串 "AKE" 表示发送所有类型的通知。


## 注意

Redis 使用以下两种方式删除过期的键：

- 当一个键被访问时，程序会对这个键进行检查，如果键已经过期，那么该键将被删除。底层系统会在后台渐进地查找并删除那些过期的键，从而处理那些已经过期、但是不会被访问到的键。
- 当过期键被以上两个程序的任意一个发现、 并且将键从数据库中删除时， Redis 会产生一个 expired 通知。

Redis 并不保证生存时间（TTL）变为 0 的键会立即被删除：如果程序没有访问这个过期键， 或者带有生存时间的键非常多的话，那么在键的生存时间变为 0 ， 直到键真正被删除这中间，可能会有一段比较显著的时间间隔。

因此，Redis 产生 expired 通知的时间为过期键被删除的时候，而不是键的生存时间变为 0 的时候。如果 Redis 正确配置且负载合理的，延时不会超超过 1s。

此外，因为 Redis 目前的订阅与发布功能采取的是发送即忘（fire and forget）策略，所以如果你的程序需要可靠事件通知（reliable notification of events），那么目前的键空间通知可能并不适合你： 当订阅事件的客户端断线时，它会丢失所有在断线期间分发给它的事件。针对这个问题，可以开启多个客户端连接来提高可靠性，因为 Redis 会通知所有订阅了的客户端。


## 实现

```
var Redis = require('ioredis');
var redis = new Redis();

// 订阅 subscribe: 订阅具体键名，支持一次可以订阅多个
redis.subscribe('__keyspace@0__:mykey1', '__keyspace@0__:mykey2', function (err, count) {})

// 模式匹配订阅 psubscribe: 匹配模式订阅
redis.psubscribe('__keyspace@*:order*', function (err, count) {});

// 普通订阅通知处理
redis.on('message', function (channel, message) {
  console.log('Receive message %s from channel %s', message, channel);
});

// 模式匹配订阅通知处理
redis.on('pmessage', function (channel, key, message) {
  console.log('Receive pmessage %s on key %s from channel %s', message, key, channel);
});

```

## 测试

```
redis-cli config set notify-keyspace-events AKE
redis-cli
> setex mykey1 1 0
> setex mykey2 1 0
> setex order:123456 1 0
> setex order:123457 1 0
```

```
Receive message set from channel __keyspace@0__:mykey1
Receive message expire from channel __keyspace@0__:mykey1
Receive message expired from channel __keyspace@0__:mykey1
Receive message set from channel __keyspace@0__:mykey2
Receive message expire from channel __keyspace@0__:mykey2
Receive message expired from channel __keyspace@0__:mykey2
Receive pmessage set on key __keyspace@0__:order:123456 from channel __keyspace@*:order*
Receive pmessage expire on key __keyspace@0__:order:123456 from channel __keyspace@*:order*
Receive pmessage expired on key __keyspace@0__:order:123456 from channel __keyspace@*:order*
Receive pmessage set on key __keyspace@0__:order:123457 from channel __keyspace@*:order*
Receive pmessage expire on key __keyspace@0__:order:123457 from channel __keyspace@*:order*
Receive pmessage expired on key __keyspace@0__:order:123457 from channel __keyspace@*:order*
```

## 多实例

单个实例可能断线，致使错过了接收延时消息。我们可以通过多实例尽可能的提高可靠性。

Redis 会将通知推送给所有合适的监听者，所以多实例时会收到多份通知，但我们只需要一个处理者。针对这个问题，我们要通过锁来处理。

```
var Redis = require('ioredis');
var sub = new Redis();
var client = new Redis();
var lock = require('ioredis-lock').createLock(client);

sub.psubscribe('__keyspace@0__:order*', function (err, count) {});

sub.on('pmessage', function (channel, key, message) {
  if (channel === '__keyspace@0__:order*') {
    lock.acquire(key, function (err) {
      if (err) return // 获取锁失败，返回
      console.log('handle notification %s', key) // 获取锁成功，处理通知
    })
  }
});

```
