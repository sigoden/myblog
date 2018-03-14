---
title: "使用 git 阅读开源项目时的小技巧"
slug: "gitbang-zhu-yue-du-kai-yuan-xiang-mu"
date: 2017-05-17T21:31:17Z
tags: ["tips", "git", "opensource"]
excerpt: "开源项目在早期版本时代码量少，结构简练，且创意和思想已经足够成熟，是切入开源项目的好时机，我们可以使用 git 回溯项目早期代码，并在各个提交间畅游。"

---

## 为什么要阅读开源项目

- 源码是唯一的真实
- 加深对项目的理解
- 学习自己没有的知识
- 学习他人的写法，有助于自己代码质量的提高


## 开源项目难点

- 不知道从哪儿开始
- 文件太多，无法屡清楚结构
- 代码太多，测试编译时耗费太多时间
- 内容太多，难以全面理解

## 开源项目特点

开源项目最早只是一个 idea, 这个 idea 是这个项目的根，随着项目的发展，特性会越来越多，架构可能会调整，但这个 idea 总是不变的，它是整个项目的精华。
而我们如果想要理解一个开源项目，弄懂这个 idea 是必须的，很多时候我们就是为了深入理解这个 idea 才产生阅读源码的动机。

随者这个 idea 的实现，这个项目算是诞生了。但随着越来越多特性的加入，越来越多代码的提交，这个 idea 越来越深的掩藏起来。所以我们可以从**早期版本**入手。

最早完成 idea 的版本中这个 idea 是最清晰的，代码量是最少的，也是我们理解这个项目的最佳时机。

## 使用 git 帮助理解开源项目

早期版本是切入开源项目的好时机，git 是版本控制领域的佼佼者，使用 git 帮助理解开源项目


### 逆序查看日志

```
git log --reverse
```

### 找一个感兴趣的版本切入

```
git checkout <commit-id>
```

### 导航与对比


- 切换当前提交的上一次提交

```
git checkout HEAD~
```

- 切换当前提交的下一次提交

```
git log --reverse --pretty=%H master | grep -A 1 $(git rev-parse HEAD) | tail -n1 | xargs git checkout;
```

- 比较上一个分支与当前分支

```
git diff HEAD~..HEAD
```

### 追踪文件的变更历史

```
git log --follow path/to/source_file
```
根据需要，可以专门阅读该文件相关的某个特定的 commit，很多时候项目第一版的代码会比最新版的代码简单很多，阅读旧版的代码可能会比较容易。如果是为了修复 bug 而读代码，这样的变更历史有时候可以提示我们哪个 commit 可能引入了 bug。


### 查找字段

```
git grep -w func -A100 -B100
```
假设有一个内部函数叫做`func()`, 没有文档，如何知道这个函数怎么用？除了阅读内部函数的实现和阅读实例，基本上没有其他方法。对于这种情况
可以批量找到 func 的用例，在 vim 里从上往下先扫一遍，找到尽可能简单的用例，然后再返回到源文件中阅读这个用例的上下文。


### 别名 

有些常用的 git 操作，我们可以通过设置 git alias 加快输入

```
git config --global alias.prev 'checkout HEAD~'
git config --global alias.next '! f() { git log --reverse --pretty=%H ${1:-master} | grep -A 1 $(git rev-parse HEAD) | tail -n1 | xargs git checkout; }; f'
git config --global alias.difp 'diff HEAD~..HEAD'
```
