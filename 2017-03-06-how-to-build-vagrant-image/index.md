---
title: "从零开始创建 Vagrant 镜像"
slug: "cong-ling-kai-shi-da-jian-vagrantrong-qi-2"
date: "2017-03-16"
tags: ["howto", "vagrant"]
excerpt: "Vagrant 是一个用于创建和部署虚拟化开发环境的工具。vagrant 镜像是一个 vagrant 用来启动虚拟机的文件，通常是纯净的操作系统镜像，如 Ubuntu, Debian，CentOS 打包生成。但我们也可以选择一款操作系统，在其上安装配置我们需要的工具和软件，然后打包成一个自定义 vagrant 镜像。通过 vagrant 镜像我们可以随时随地复用我们的安装配置，可也以分享给他人使用。尽管 Vagrant 官方有免费的镜像仓储，但是网络连接很是问题，这时候自己动手创建镜像不失为一种很好的手段。本文介绍如何创建一款自己的 vagrant 镜像。"

---

我们将通过 virtualbox, 安装运行 ubuntu-server-16.04.2 操作系统，再在其上安装 docker-17.03.0, 然后将这一切打包成为一个名为 ubuntu-16.04-docker-17.03.0 的 vagrant 镜像

## 准备

* [virtualbox](https://www.virtualbox.org/)
* [vagrant](https://www.vagrantup.com/downloads.html)
* [ubuntu-server-16.04.2.iso](https://www.ubuntu.com/download/server)

下载并安装 vagrant 和 virtualbox, 下载 ubuntu-server-16.04.2.iso 文件

## 虚拟机安装运行 ubuntu

配置虚拟机有几点要注意：

* 硬盘空间动态且足够，这里选择 8G 默认值
* 网路适配器 1(Network > Adapter1) 必须是 NAT, 选择默认值
* 内存可以适当小一点，这里选择 512M
* 禁掉非必须的硬件比如声卡，USB 控制器

安装 ubuntu server 时也有几点需要注意：

* 安装区域最好选择您所在区域
* 用户名设置：vagrant, 密码也是：vagrant

## 设置 root 密码为 vagrant
```
sudo passwd root #连续两次输入 vagrant
```
检查是否设置成功
```
su - #输入 vagrant 可以切换到 root
```

## 设置 vagrant 用户无密码运行 sudo

需 vagrant 用户需自由运行 sudo 命令而不用输入密码
```
sudo visudo -f /etc/sudoers.d/vagrant
```
添加下面内容到文件
```
vagrant ALL=(ALL) NOPASSWD:ALL
```
这样在使用 sudo 时就不必在输入密码了
可以通过下面命令确认配置是否生效
```
sudo pwd
```

## vagrant 用户安装 ssh 公钥
vagrant 通过 ssh 与虚拟机交互，我们需要从 github 下载公钥安装到 vagrant 用户
```
mkdir -p /home/vagrant/.ssh
chmod 0700 /home/vagrant/.ssh
wget --no-check-certificate \
    https://raw.github.com/mitchellh/vagrant/master/keys/vagrant.pub \
    -O /home/vagrant/.ssh/authorized_keys
chmod 0600 /home/vagrant/.ssh/authorized_keys
chown -R vagrant /home/vagrant/.ssh
```

## 配置 SSH 服务

安装 ssh 服务器
```
sudo apt-get update -y
sudo apt-get install -y openssh-server
```
默认情况下 ssh 会查找 DNS, 离线情况下这种行为会浪费很多时间，所以我们需要配置`UseDNS no`来阻止这种行为
```
sudo vi /etc/ssh/ssh_config
```
添加
```
UseDNS no
```

## 安装 VirtualBox Guest Additions
VirtualBox Guest Additions 提供了共享文件夹功能，此为对性能还有一些优化，所以有必要安装

* 更新应用包
```
sudo apt-get update -y
sudo apt-get upgrade -y
```

* 安装依赖
```
sudo apt-get install -y linux-headers-$(uname -r) build-essential dkms
```

* 安装 VBoxLinuxAdditions
>
1. 点击 Virtualbox 菜单：devices > Insert Guset Additions CD Image.. 挂载镜像
2. 挂载镜像到文件系统`sudo mount /dev/cdrom /media/cdrom`
3. 运行安装脚本`sudo sh /media/cdrom/VBoxLinuxAdditions.run`

## 自定义

这步是可选步骤

我们也可以安装一些我们喜欢的工具，进行一些常用配置
此处我们安装 docker

通过阿里云镜像网站安装 docker 最新版
```
curl -sSL http://acs-public-mirror.oss-cn-hangzhou.aliyuncs.com/docker-engine/internet | sudo sh -
```
将 vagrant 用户加入到 docker 组
```
sudo usermod -aG docker vagrant
```

## 清理
为了尽可能减小镜像的体积，我们进行一些清理

首先清理安装包
```
sudo apt-get clean
```

磁盘碎片整理
```
sudo dd if=/dev/zero of=/EMPTY bs=1M
sudo rm -f /EMPTY
```

清除 Bash 历史
```
echo > ~/.bash_history && history -c
```

## 打包
```
vagrant package --output ubuntu-16.04-docker-17.03.0.box --base ubuntu
```
- `output`: 输出镜像文件位置
- `base`: 从运行中虚拟机 ubuntu 导出镜像

## 结论
到此，我们的自定义 vagrant 镜像就算制作完成了，你可以导入后运行，也可以分享给好友和同事。

