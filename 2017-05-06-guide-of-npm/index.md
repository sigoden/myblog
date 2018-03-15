---
title: "一份详见的 npm 参考手册"
slug: "npm-can-kao-shou-ce"
date: 2017-05-06
tags: ["guide", "nodejs", "npm"]
excerpt: "一份详见的 npm 使用手册"
notoc: true

---

## 索引

- [权限](#perm)
  - [t/team 组织成员管理](#tteam)
  - [access 包访问控制](#access)
  - [adduser/login 用户登录](#adduserlogin)
  - [logout 注销](#logout)
  - [owner 所有者管理](#owner)
  - [whoami 查看用户信息](#whoami)
- [仓储](#pkg-remote)
  - [s/se/search 仓储查找包](#ssesearch)
  - [publish 发布](#publish)
  - [unpublish 取消发布](#unpublish)
  - [deprecate 弃用 ](#deprecate)
  - [stars 我喜欢的包](#stars)
  - [star 喜欢](#star)
  - [unstar 取消喜欢](#star)
- [本地](#pkg-local)
  - [init 初始化 package.json](#init)
  - [i/install 安装](#iinstall)
  - [un/uninstall 删除](#ununinstall)
  - [dedupe/ddp 清除重复包](#dedupeddp)
  - [dist-tags 标签管理](#dist-tags)
  - [version 更新包的版本信息](#version)
  - [it/install-test 运行 npm install && npm test](#itinstall-test)
  - [ln/link 安装链接](#lnlink)
  - [ls/list 列出包](#lslist)
  - [update/up 更新并安装遗漏的包](#updateup)
  - [outdated 检测过期](#outdated)
  - [pack 打包 tarball 文件](#pack)
  - [prune 清理外来包](#prune)
  - [shrinkwrap 锁定依赖包版本](#shrinkwrap)
  - [cache 缓存管理](#cache)
- [脚本](#script)
  - [run/run-script 运行脚本](#runrun-script)
  - [start 运行 start 脚本](#start)
  - [stop 运行 stop 脚本](#stop)
  - [tst/test 运行 test 脚本](#tsttest)
  - [rb/rebuild 重新编译本地包](#rbrebuild)
  - [restart  顺序执行重启相关的一系列脚本](#restart)
- [配置](#conf)
  - [c/config 配置管理](#cconfig)
  - [get 列出配置](#get)
  - [set 设置配置](#set)
- [查看](#inspect)
  - [root  包根目录](#root)
  - [prefix 打印 prefix 配置](#prefix)
  - [v/view 查看仓储信息](#vview)
  - [bin 查看 bin 目录](#bin)
  - [bugs/issue 浏览器查看 bugs](#bugsissue)
  - [docs/home 浏览器查看帮助文档](#docshome)
  - [repo 浏览器查看仓储](#repo)
  - [help 查看帮助](#help)
  - [help-search 帮助中搜索关键字](#help-search)
- [其他](#misc)
  - [completion 命令补全](#completion)
  - [doctor 环境检测](#doctor)
  - [edit 进入包目录并启动编辑器](#edit)
  - [explore 进入包目录并运行命令](#explore)
  - [ping 检查仓储是否可用](#ping)

## 权限

npm 允许通过 scope 组织私有包，通过 team 细化权限控制。

npm 官方仓储有两种类型的包，普通包和 scope 包

普通包特征：
- 只能公有，谁都可以下载使用
- 仅可以通过所有者 (owner) 进行权限控制，如果要允许某个用户修改或发布包，必须将该用户添加到包的所有者列表。添加到包所有者列表的用户具备所有的权限。

scope 包特征：
- 包名有两部组成，@scope/name, @后的为 scope 名，/ 后的才是具体的包名
- 可以控制公有和私有
- 细化的权限控制，比如可以创建团队，并赋予团队对包只读 / 修改的权限


### owner

```
npm owner add <user> [<@scope>/]<pkg> # 将用户添加到包的所有者列表
npm owner rm <user> [<@scope>/]<pkg> # 从包的所有这列表中删除用户
npm owner ls [<@scope>/]<pkg> # 列出包的所有者
```
成为包的所有者的用户，将能够修改元数据（如标记弃用），发布新版本，添加其他用户到包的所有者列表

### t/team

```
npm team create <scope:team> # 创建团队
npm team destroy <scope:team> # 删除团队

npm team add <scope:team> <user> # 添加用户到团队
npm team rm <scope:team> <user> # 从团队中移除用户

npm team ls <scope>|<scope:team> 列出团队 / 成员

npm team edit <scope:team>  用编辑器编辑团队信息
```

### access

```
npm access public [<package>]  # 设置包开放
npm access restricted [<package>] # 设置包私有

npm access grant <read-only|read-write> <scope:team> [<package>] # 设置团队对包可以只读 / 允许修改
npm access revoke <scope:team> [<package>] # 从团队中收回包权限

npm access ls-packages [<user>|<scope>|<scope:team>]  # 列出用户 / 域 / 团队能够访问的包
npm access ls-collaborators [<package> [<user>]] # 列出包的权限信息
npm access edit [<package>] # 用编辑器编辑包权限
```

### adduser/login

```
npm adduser [--registry=url] [--scope=@orgname] [--always-auth]
```
提示输入 username, password, email，进行登录校验，返回 token 保存到.npmrc

### logout

```
npm logout [--registry=<url>] [--scope=<@scope>]
```
请求仓储服务将当前 token 失效

### whoami

```
npm whoami [--registry <registry>]
```
列出用户在 npmjs.org 上的用户名

## 仓储

### s/se/search

```
npm search [-l|--long] [--json] [--parseable] [--no-description] [search terms ...]
```

- -l|--long: 展示出全部的 DESCRIPTION 栏信息
- --no-description: 不显示 DESCRIPTION 栏信息

### publish

```
npm publish [<tarball>|<folder>] [--tag <tag>] [--access <public|restricted>]
```

- --tag: 带上 tag 信息发布，之后包可以通过`npm install <name>@<tag>`安装
- --access: 仅适用于 scope 包，默认为 restricted

### unpublish

```
npm unpublish [<@scope>/]<pkg>[@<version>]
```

从仓储中删除包，该操作会破坏依赖，不推荐适用，如果是为了鼓励用户适用新版本，可以使用 deprecate 命令

### deprecate

```
npm deprecate <pkg>[@<version>] <message>
```

标记包弃用，用户在安装时 npm 会有警告

### stars

```
npm stars [<user>]
```

查看用户喜欢的包

### star/unstart

```
npm star [<pkg>...]
npm unstar [<pkg>...]
```

标记喜欢 / 取消喜欢标记

## 本地

### init

```
npm init [-f|--force|-y|--yes]
```

初始化 package.json,  默认会有很多输入提示，可以通过`-f|--force|-y|--yes`选项创建默认配置的 package.json
已经存在 package.json 后再次运行`npm init`不会破坏已有配置，只会变更你真正改动的部分

### i/install 
```
npm install (with no args, in package dir) # 读取 package.json 安装
npm install [<@scope>/]<name> # 默认安装标签为 latest
npm install [<@scope>/]<name>@<tag> # 指定标签
npm install [<@scope>/]<name>@<version> # 指定版本
npm install [<@scope>/]<name>@<version range> # 指定版本范围
npm install <tarball file>  # 通过 tarball 文件安装
npm install <tarball url> # 通过 tarball 文件 url 链接安装
npm install <git remote url> # 通过 git 安装包，url 格式为<protocol>://[<user>[:<password>]@]<hostname>[:<port>][:][/]<path>[#<commit-ish>]
npm install <folder> 通过包所在的文件夹安装
```

- --registry: 从指定仓储中下载安装包
- -S/--save: 安装并保存包信息到 package.json 的 dependencies 区
- -D/--save-dev: 安装并保存包信息到 package.json 的 devDependencies 区
- --tag: 优先根据标签而不是版本安装包
- --dry-run: 报告安装状况而不真的安装
- -f/--force: 安装时跳过缓存直接从远程下载
- -g/--global: 安装到全局
- --link: 链接全局安装的包的本地
- --no-shrinkwrap: 安装时忽略 shrinkwrap

### un/uninstall

```
npm uninstall [<@scope>/]<pkg>[@<version>]... [-S|--save|-D|--save-dev]
```
- -S/--save: 删除包并移除包在 package.json 的 dependencies 区的信息
- -D/--save-dev: 删除包并移除包在 package.json 的 devDependencies 区的信息

### ddp/dedupe

```
npm dedupe
```
npm 检查包依赖树并清除不要的包

### dist-tags

```
npm dist-tag add <pkg>@<version> [<tag>] # 添加标签
npm dist-tag rm <pkg> <tag> # 移除标签
npm dist-tag ls [<pkg>] # 列出包所包含的标签
```

常见标签有 latest, next, lts 等

可以在发布和下载包是带上标签
```
npm publish # 默认标签 latest
npm publish --tag next  # 发布 next 标签
npm install npm # 默认标签 latest
npm install npm@next
npm install --tag next
```

- --registry: 发布包到指定仓储

### v/version

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease | from-git]
```
该命令执行步骤
1. 检查 git 工作目录
2. 运行 preversion 脚本，可以写些触发测试的脚本
3. 结合当前包当前版本信息和 patch, minor, major 等，生成新版本号，更新 package.json 中 version 字段
  - patch 1.0.0 => 1.0.1
  - prepatch 1.0.0 => 1.0.1-0
  - minor 1.0.0 => 1.1.0
  - preminor 1.0.0 => 1.1.0-0
  - major 1.0.0 => 2.0.0
  - premajor 1.0.0 => 2.0.0-0
  - prerelease 1.0.0-0 => 1.0.0-1
  - from-git 从 git 获取版本信息
4. 运行 version 脚本
5. git 提交并打标签
6. 运行 postversion 脚本


### it/install-test
```
npm it
npm install-test
```
相当于运行 npm install && npm test

### ln/link

```
npm link  # 在全局 node_modules 下创建当前文件夹的超链接
npm link [<@scope>/]<pkg>[@<version>] # 将全局安装的包链接到本地 node_modules 中
```


### ls/list
```
npm ls [[<@scope>/]<pkg> ...]
```
打印依赖树

- --json: 已 json 格式输出
- --long: 展示更多信息
- --parseable: 显示展平的目录而不是依赖树
- --global: 显示全局安装的包的依赖树
- --depth: 树层级，从 0 开始
- --prod/production: 仅显示 package.json 里 dependencies 包的依赖
- --dev: 仅显示 package.json 里 devDependencies 包的依赖

### up/update
```
npm update [-g] [<pkg>...]
```

更新包到包的 semver 所允许的最新版本，并安装遗漏的包

- --save: 更新并保存更新到 package.json
- --dev: 同时更新 devDependencies 中的包
- --depth: 默认情况下仅更新顶层 (--depth=0) 为 0 的包，如果想更新所有包，可以指定 --depth=9999

### outdated

```
npm outdated [[<@scope>/]<pkg> ...]
```
.e.g
```
Package        Current  Wanted  Latest  Location
ajv              4.8.2  4.11.8   5.0.1  example
async            2.1.2   2.4.0   2.4.0  example
body-parser     1.15.2  1.17.1  1.17.1  example
```
列表栏

- Current: 当前版本
- Wanted: smever 允许的最高版本
- Latest: 仓储中最新版本
- Location: 依赖树中的位置

命令选项

- --json: 已 json 格式输出
- --long: 展示更多信息
- --parseable: 平铺展示
- --global: 显示全局安装的包的依赖树
- --depth: 树层级，默认 0

### pack

```
npm pack [[<@scope>/]<pkg>...]
```
从包生成名为`<name>-<version>.tgz`的 tarball, 并缓存

### prune

```
npm prune [[<@scope>/]<pkg>...] [--production]
```
清理不在 package.json 生成的依赖树中的包

- --production: 移除 devDependencies 中的包

### shrinkwrap

```
npm shrinkwrap
```
shrinkwrap 用来锁定依赖包的版本

包 A 的 package.json
```
{
	"name": "A",
	"version": "0.1.0",
	"dependencies": {
		"B": "<0.1.0"
	}
}

```
包 A 的依赖树
```
 A@0.1.0
	`-- B@0.0.1
		`-- C@0.0.1
```
当 B 有新版本 0.0.2 发布，B@0.0.2 满足<0.1.0, 所以`npm install A`安装成功后依赖树
```
 A@0.1.0
	`-- B@0.0.2
		`-- C@0.0.1

```
我们希望包 A 依赖的 B 版本保持在 B@0.0.1, 可以运行
```
npm shrinkwrap
```
该命令会生成 npm-shrinkwrap.json, 其内容如下
```

{
  "name": "A",
  "version": "0.1.0",
  "dependencies": {
    "B": {
      "version": "0.0.1",
      "from": "B@^0.0.1",
      "resolved": "https://registry.npmjs.org/B/-/B-0.0.1.tgz",
      "dependencies": {
        "C": {
          "version": "0.0.1",
          "from": "org/C#v0.0.1",
          "resolved": "git://github.com/org/C.git#5c380ae319fc4efe9e7f2d9c78b0faa588fd99b4"
        }
      }
    }
  }
}
```

运行`npm install`时如果存在 npm-shrinkwrap.json, npm 在安装包时会根据 shrinkwrap.json 锁定依赖包的版本

### cache

```
npm cache add <tarball file> # 添加到缓存
npm cache add <folder>
npm cache add <tarball url>
npm cache add <name>@<version>

npm cache ls [<path>]  # 缓存明细

npm cache clean [<path>] # 清除缓存
```

缓存路径可以通过`npm config get cache`获取

## 脚本

package.json 的 scripts 区可以用来定义自定义脚本


### run/run-script 

```
npm run <command> [-- <args>...]
```

运行 package.json 的 scripts 中定义的命令

npm run 会自动将`node_modules/.bin`添加到环境变量 PATH 中。如果本地安装过 mocha, 可以这样编写`"scripts": {"test": "mocha test/\*.js"}`而不需要`"scripts": {"test": "node_modules/.bin/tap test/\*.js"}`


### start

```
npm start [-- <args>]
```

等同与`npm run start [-- <args>]`

### stop

```
npm stop [-- <args>]
```

等同与`npm run stop [-- <args>]`

### tst/test

```
npm test [-- <args>]
```

等同与`npm run test [-- <args>]`

### rb/rebuild

```
npm rebuild [[<@scope>/<name>]...]
```

运行指定包中的 build 脚本，适用于更新 node 版本后，重新编译 C++ 包

### restart

```
npm restart [-- <args>]
```
循序执行`1. prerestart 2. prestop 3. stop 4. poststop 5. restart 6. prestart 7. start 8. poststart 9. postrestart`


## 配置

### c/config

```
npm config set <key> <value> [-g|--global] # 添加或更新
npm config get <key> # 获取
npm config delete <key> # 删除
npm config list #  配置明细
npm config edit # 编辑器编辑
```
- --global: 全局配置

### get

```
npm get <key> # 同 npm config get
```

### set

```
npm set <key> <value> [-g|--global] #同 npm config set
```

## 查看

### root

```
npm root # 打印本地 node_modules 目录
npm root -g # 打印全局 node_modules 目录
```

### prefix

```
npm prefix # 打印包含 package.json 最近父目录
npm prefix -g # 打印全局配置 prefix 的值
```

### view 

```
npm view [<@scope>/]<name>[@<version>] [<field>[.<subfield>]...]
```

查看仓储信息

```
npm view compact


#  打印
{ name: 'compact',
  description: 'A JavaScript compacting middleware for express',
  'dist-tags': { latest: '0.1.2' },
  maintainers: [ 'serby <paul@serby.net>' ],
  time:
   { modified: '2017-03-28T12:49:48.000Z',
     created: '2012-02-06T01:39:50.261Z',
     '0.1.2': '2012-09-04T11:19:17.618Z',
     '0.1.1': '2012-08-29T08:18:12.345Z',
     '0.1.0': '2012-07-09T14:40:56.751Z',
     '0.0.7': '2012-07-04T17:14:01.593Z',
     '0.0.6': '2012-06-29T14:29:04.847Z',
     '0.0.5': '2012-05-23T10:10:15.010Z',
     '0.0.4': '2012-03-31T09:05:40.450Z',
     '0.0.3': '2012-03-23T15:25:18.289Z',
     '0.0.2': '2012-03-21T18:15:24.718Z',
     '0.0.1': '2012-02-06T01:39:50.261Z' },
  users: { serby: true },
  author: 'Paul Serby <paul@serby.net>',
  repository: { type: 'git', url: 'git://github.com/serby/compact.git' },
  versions:
   [ '0.0.1',
     '0.0.2',
     '0.0.3',
     '0.0.4',
     '0.0.5',
     '0.0.6',
     '0.0.7',
     '0.1.0',
     '0.1.1',
     '0.1.2' ],
  version: '0.1.2',
  main: './lib/compact.js',
  scripts: { test: 'mocha -r should -R spec' },
  engines: { node: '>=0.8' },
  dependencies:
   { lodash: '~0.3',
     async: '~0.1',
     'uglify-js': '~1.3',
     mkdirp: '~0.3' },
  devDependencies: { mocha: '*', should: '~1.1', async: '~0.1', asyncjs: '~0.0' },
  optionalDependencies: {},
  dist:
   { shasum: '66361e17108185bf261d42aff6a91b925e473139',
     size: 7603,
     noattachment: false,
     tarball: 'http://registry.npm.taobao.org/compact/download/compact-0.1.2.tgz' },
  directories: {},
  publish_time: 1346757557618 }
```

```
npm view compact@0.1.2 dependencies

# 打印
{ lodash: '~0.3',
  async: '~0.1',
  'uglify-js': '~1.3',
  mkdirp: '~0.3' }
```

### bin

```
npm bin # 打印包含 npm bin 目录，通常为 node_modules/.bin/
npm prefix -g # 打印全局 npm bin 目录
```

### bugs/issue

```
npm bugs [<packagename>]
```
打开包 bug 追踪 url

```
npm bugs npm # 浏览器打开 https://github.com/npm/npm/issues
```

### docs/home

```
npm docs [<pkgname> [<pkgname> ...]]
npm docs .
npm home [<pkgname> [<pkgname> ...]]
npm home .
```

打开文档 url

```
npm docs npm #浏览器打开 https://docs.npmjs.com/
```

### repo

```
npm repo [<pkg>]
```

打开 git url
```
npm repo npm #浏览器打开 https://github.com/npm/npm
```

### help

```
npm help <term> [<terms..>]
```

打印特定术语或命令的帮助

### help-search

```
npm help-search <text>
```

从 npm 官方 markdown 文档中搜索词条

## 其他

### completion

```
npm completion >> ~/.bashrc
```
npm 命令补全

### doctor

```
npm doctor
```

环境检测
- npm 能调用 node 和 git 命令
- registry 能够访问
- 本地和全局 node\_modules 可写
- 缓存存在且 tarball 文件健全

### edit

```
npm edit <pkg>[@<version>]
```

进入包目录并启动编辑器

### explore

```
npm explore <pkg> [-- <cmd>]
```

进入包目录并运行命令
```
npm explore connect -- ls

# 打印
HISTORY.md  index.js  LICENSE  node_modules  package.json  README.md
```

### ping

```
npm ping [--registry <registry>]
npm ping --registry https://registry.npmjs.org
```

检查仓储是否可用
