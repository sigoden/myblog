---
title: "npm 安装的包为什么不一致"
date: "2017-03-25"
slug: "npman-zhuang-de-bao-wei-shi-yao-bu-yi-zhi"
tags: ["why", npm", "nodejs"]
excerpt: "npm 包在安装是可能会产生不一致的目录，这是如何产生的？本文将对不一致原因进行分析"

---

## NPM 是什么

NPM（node package manager），通常称为 node 包管理器。顾名思义，它的主要功能就是管理 node 包，包括：安装、卸载、更新、查看、搜索、发布等，npm 将开发者从繁琐的包管理工作（版本、依赖等）中解放出来，更加专注于功能的开发。

## NPM 模块复制

从 npm3 开始，npm 对包安装进行了优化，如果模块 A 和模块 C 都依赖了模块 B, 模块 B 将只安装一次。
![npm-copy](https://cdn.sigoden.com/npm-module-copy.png)

在早期版本，依赖的模块是直接装在模块自己的 node_modules 下的
![npm-old](https://cdn.sigoden.com/npm-module-old.png)

这也是为什么用户在切换到 npm3 后 node_modules 下无缘无故多出那么多包的原因

## 安装顺序对包结构影响

#### 生成测试包

生成包`a@1.0.0`, `b@1.0.0`,`b@2.0.0`, `c@1.0.0`，其中`a@1.0.0`依赖`b@1.0.0`, `c@1.0.0`依赖`b@2.0.0`

```
创建包目录
mkdir -p /tmp/repositories/{a-1.0.0, b-1.0.0, b-2.0.0, c-1.0.0}

b@1.0.0
vi /tmp/repositories/b-1.0.0/index.js
module.exports = 'b-1.0.0'

vi /tmp/repositories/b-1.0.0/package.json
{
  "name": "b",
  "version": "1.0.0",
  "main": "index.js"
}

b@2.0.0
vi /tmp/repositories/b-2.0.0/index.js
module.exports = 'b-2.0.0'

vi /tmp/repositories/a-2.0.0/package.json
{
  "name": "b",
  "version": "2.0.0",
  "main": "index.js"
}


a@1.0.0
vi /tmp/repositories/a-1.0.0/index.js
exports.a = 'a-1.0.0'
exports.b = require('b')

vi /tmp/repositories/a-1.0.0/index.js
{
  "name": "a",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "b": "file:///tmp/repositories/b-1.0.0/b-1.0.0.tgz"
  }
}


c@1.0.0
vi /tmp/repositories/c-1.0.0/index.js
exports.c = 'c-1.0.0'
exports.b = require('b')

vi /tmp/repositories/c-1.0.0/index.js
{
  "name": "c",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "b": "file:///tmp/repositories/b-2.0.0/b-2.0.0.tgz"
  }
}

```

#### 测试包打包 tarball
为了方便安装，我们通过`npm pack`将包转换为 tgz 文件
```
cd /tmp/repositories/a-1.0.0 && npm pack
cd /tmp/repositories/b-1.0.0 && npm pack
cd /tmp/repositories/b-2.0.0 && npm pack
cd /tmp/repositories/c-1.0.0 && npm pack
```

#### 先安装包 a, 再安装包 c

```
mkdir /tmp/stage1
cd /tmp/stage1
npm i /tmp/repositories/a-1.0.0/a-1.0.0.tgz
npm i /tmp/repositories/c-1.0.0/c-1.0.0.tgz

查看目录结构
tree /tmp/stage1
.
├── node_modules
│   ├── a
│   │   ├── index.js
│   │   └── package.json
│   ├── b
│   │   ├── index.js
│   │   └── package.json
│   └── c
│       ├── index.js
│       ├── node_modules
│       │   └── b
│       │       ├── index.js
│       │       └── package.json
│       └── package.json
└── README.md

查看外部包 b 的版本
cat node_modules/b/package.json | grep version #1.0.0

查看包 c 依赖包 b 的版本
cat node_modules/c/node_modules/b/package.json | grep version #2.0.0

```
可以看到在安装包 a 时，npm 同时将其依赖包`b@1.0.0`安装在最外层`node_modules`下，而安装包 c 时，npm 检查到包 b 已存在但是不同版本，将包 b 安装到包 c 自己的 node_modules 下
![npm-a-and-c](https://cdn.sigoden.com/npm-a-and-c.png)

#### 先安装包 c, 再安装包 a

```
mkdir /tmp/stage2
cd /tmp/stage2
npm i /tmp/repositories/c-1.0.0/c-1.0.0.tgz
npm i /tmp/repositories/a-1.0.0/a-1.0.0.tgz

查看目录结构
tree /tmp/stage2
.
├── node_modules
│   ├── a
│   │   ├── index.js
│   │   ├── node_modules
│   │   │   └── b
│   │   │       ├── index.js
│   │   │       └── package.json
│   │   └── package.json
│   ├── b
│   │   ├── index.js
│   │   └── package.json
│   └── c
│       ├── index.js
│       └── package.json
└── README.md

查看外部包 b 的版本
cat node_modules/b/package.json | grep version #2.0.0

查看包 c 依赖包 b 的版本
cat node_modules/a/node_modules/b/package.json | grep version #1.0.0

```
可以看到在安装包 c 时，npm 同时将其依赖包`b@2.0.0`安装在最外层`node_modules`下，而安装包 a 时，npm 检查到包 b 已存在但是不同版本，将包 b 安装到包 a 自己的 node_modules 下
![npm-c-and-a](https://cdn.sigoden.com/npm-c-and-a.png)

## 结论

从上面的测试中可以看到，安装同样的包，因为安装顺序的不一致，会产生不一致的目录结构。如果安装顺序一致，`node_modules`目录结构也会是一致的。
