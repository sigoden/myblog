---
title: "我们该以何种风格写 javascript"
slug: "javascriptbiao-zhun-dai-ma-feng-ge"
date: "2017-04-06"
tags: ["option", "javascript"]
excerpt: "JavaScript 是一种多范式的灵活的动态语言，为了强化协作，我们常常需要再项目中选定一种风格，如何选择呢？"

---

## 你需要一份代码风格

良好的代码风格，不仅仅有助于自己在以后阅读的时候能够方便简单的读懂，也是方便他人阅读理解。尤其是在团队合作的时候，如果每个人都很随意的自己用自己的方式，不仅不好维护，互相也不能理解代码意思。这样反而拖延工作量，浪费时间，降低效率。不同的代码风格严重时也可能造成纷争，影响团队和谐。

## 你需要代码检查工具

代码风格如果不被遵守，就完全没有意义。如何确保每个人写出来的代码都符合你所定义的风格，这就需要工具了。eslint 是 javascript 社区最优秀的代码风格检查工具。它提供了一套相当完善的插件机制，可以自由的扩展，动态加载配置规则，同时可以方便的根据报错定位到具体的规则配置。每一条代码风格都是可以通过 eslint 配置的。

## 你需要强制你的项目使用一种风格

比选则代码风格更重要的是坚持。只有坚守一种代码风格，我们才能享受到统一的便利。如何强制大家使用一份代码风格呢？

- 如果使用 webpack, 需要再 webpack 中配置 eslint
- 在 package.json 中添加钩子如 pretest, prebuild, prepublish, 强制在特点操作前运行 eslint 检查代码风格。

## 常用代码风格

- [standard](https://standardjs.com/)
- [aribnb](https://github.com/airbnb/javascript)
- [google](https://github.com/google/eslint-config-google)

这里分享一个技巧:

在配置完成之后，如果检查发现问题，可以尝试通过 `eslint --fix` 自动修复一下代付风格方面的错误。
