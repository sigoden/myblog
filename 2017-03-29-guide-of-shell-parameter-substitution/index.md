---
title: "shell 参数替换"
slug: "shell-can-shu-ti-huan"
date: 2017-03-29
tags: ["shell", "linux"]
notoc: true
excerpt: "如何设置默认变量，如何进行字符截取，如何对变量应用正则进行检测和替换，这些都可以通过 shell 参数替换实现。"

---

## ${parameter}
**等同 $paramter，常见于拼接字符串时，使变量表述更清晰**
```shell
var=1
var_default=2
echo ${var}_default # 1
echo $var_default # 2
```

## ${parameter-default}, ${parameter:-default}
**如果参数 parameter 没有设置，使用 default 值**
```
var1=1
var2=2
echo ${var3-$var1} # 1
echo ${var2-$var1} # 2
```
${parameter:-default}与 ${parameter-default}不同之处在于： parameter 声明了但为空时， ${parameter-default}认为 parameter 已设置，而 ${parameter:-default}认为 parameter 没有设置
```
var1=
echo ${var1-1} # 空
echo ${var1:-1} # 1
```

## ${parameter=default}, ${parameter:=default}
**如果参数 parameter 没有设置，设置 parameter 值为 default, 并返回 default**
```
var1=1
echo ${var1=2} # 1
echo ${var2=2} # 2
echo $var2 # 2
```
{parameter=default}与 ${parameter-default}不同之处在于：parameter 没有设置时，{parameter=default}返回 default 的同时设置参数 parameter 值为 default

${parameter:=default}与 ${parameter=default}不同之处在于： parameter 声明了但为空时， ${parameter=default}认为 parameter 已设置，而 ${parameter:=default}认为 parameter 没有设置
```
var1=
echo ${var1-1} # 空
echo $var1 # 空
echo ${var1:-1} # 1
echo $var1 # 1
```

## ${parameter+alt}, ${parameter:+alt}
**如果参数 parameter 有设置，返回 alt**
```
var1=1
echo ${var1+2} # 2
echo ${var2+2} # 空
```
${parameter:+alt}与 ${parameter+alt}不同之处在于： parameter 声明了但为空时， ${parameter+alt}认为 parameter 已设置，而 ${parameter:+alt}认为 parameter 没有设置
```
var1=
echo ${var1+2} # 2
echo ${var1:+2} # 空
```

## ${parameter?err\_msg}, ${parameter:?err\_msg}
**如果参数 parameter 没有设置，打印 err_msg 并中断执行，且退出状态为 1**
```
var1=1
echo ${var1?bad} # 1
echo ${var2?bad} #  var2: bad

#查看退出状态
echo $? # 1
```
${parameter:?err\_msg}与 ${parameter?err\_msg}}不同之处在于： parameter 声明了但为空时， ${parameter?err\_msg}认为 parameter 已设置，而 ${parameter:?err\_msg}认为 parameter 没有设置
```
var1=
echo ${var1?bad} # 空
echo ${var1：?bad} # var1: bad

#查看退出状态
echo $? # 1
```

## ${\#var}

**变量 $var 的字符数**
```
var1=abc
echo ${#var1} # 3
```
当 $var 为数组时，${#var}返回数组第一个元素的字符数，${#var[*]}和 ${#var[@]}返回数组个数
```
declare -A a
a[0]=abc
a[1]=def
echo ${#a} # 3
echo ${#a[@]} # 2
echo ${#a[*]} # 3
b=(abc def)
echo ${#b} # 3
echo ${#b[@]} # 2
echo ${#b[*]} # 3
```

## ${var#Pattern}, ${var##Pattern}
**从 $var 的头部开始匹配 Pattern，移除匹配的部分，返回剩余部分**
```
var=abc
echo ${a#a} # bc
echo ${a#ab} # c
echo ${a#abc} # 空
echo ${a#bc} # abc
```
${var##Pattern}与 ${var#Pattern}不同之处在于：${var#Pattern}进行尽可能少的匹配，而 ${var##Pattern}尽可能多的匹配
```
var=abaaab
echo ${var#ab*a} # aab
echo ${var##ab*a} # b
```

## ${var%Pattern}, ${var%%Pattern}
**从 $var 的尾部开始匹配 Pattern，移除匹配的部分，返回剩余部分**
```
var=abc
echo ${a%c} # ab
echo ${a%bc} # a
echo ${a%abc} # 空
echo ${a%ab} # abc
```
${var%%Pattern}与 ${var%Pattern}不同之处在于：${var%Pattern}进行尽可能少的匹配，而 ${var%Pattern}尽可能多的匹配
```
var=baaaba
echo ${var%a*ba} # baa
echo ${var%%a*ba} # b
```

## ${var:pos}
**从 pos+1 处开始截取 $var**
```
var=abcdef
echo ${var:0} # abcdef
echo ${var:1} # bcdef
echo ${var:6} # 空
echo ${var:7} # 空
echo ${var:-1} # abcdef, 当 pos 为负数，直接返回 $var
```

## ${var:pos:len}
**从 pos+1 处开始截取 $var, 当 len 为正整数，截取长度不超过 len；当 len 为负数，截取到倒数第 len 个字符。**
```
var=abcdef
echo ${var:1:1} # b
echo ${var:1:6} # bcdef
echo ${var:1:7} # bcdef
echo ${var:1:-1} # bcde
echo ${var:3:-3} # 空
echo ${var:4:-3} # substring expression: 3 < 4 错误
echo ${var:-1:1} # abcdef, 当 pos 为负数，直接返回 $var
echo ${var:-1:-1} # abcdef
```

## ${var/Pattern/Replacement}
**从 $var 中将匹配 Pattern 的部分替换为 Replacement**
```
var=aaabcdef
echo ${var/a/A} # Aaabcdef
echo ${var/a*e/A} # Af
```
### ${var//Pattern/Replacement}
${var//Pattern/Replacement}与 ${var/Pattern/Replacement}不同之处在于：${var//Pattern/Replacement}进行的是全局匹配，${var/Pattern/Replacement}只匹配首次
```
var1=aaabcdef
echo ${var1/a/A} # AAAbcdef
var2=abcab
echo ${var2/ab/AB} # ABcAB
```
### ${var/#Pattern/Replacement}
${var/#Pattern/Replacement}与 ${var/Pattern/Replacement}不同之处在于：${var/#Pattern/Replacement}限制从头部开始匹配
```
var=abcab
echo ${var/#ab/AB} # ABcab
echo ${var/ab/AB} # ABcab
echo ${var/#bc/BC} # abcab
echo ${var/bc/BC} # aBCab
```
### ${var/%Pattern/Replacement}
${var/%Pattern/Replacement}与 ${var/Pattern/Replacement}不同之处在于：${var/%Pattern/Replacement}限制从尾部开始匹配
```
var=abcab
echo ${var/#ab/AB} # abcAB
echo ${var/ab/AB} # ABcab
echo ${var/#bc/BC} # abcab
echo ${var/bc/BC} # aBCab
```

## ${!varprefix*}, ${!varprefix@}
**查找以 varprefix 开头的变量名**
```
var1=1
var2=2
myvar=3
echo ${!var*} # var1 var2
echo ${!var@} # var1 var2
```
