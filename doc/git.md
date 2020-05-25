# Git 使用指南

### 从远程 master 分支 checkout 文件到当前分支：
> git checkout origin/master -- code.php

### 从当前分支创建新分支
> git checkout -b develop

#### 把当前分支 push 到远程
> git push origin develop

#### 关联远程分支
> git branch --set-upstream-to origin develop

#### 迁移 git 地址，切换远程仓库
- 直接修改
> git remote set-url origin url
- 先删后加
> git remote rm origin
>
> git remote add origin url
- 修改 config 文件
在项目根目录下找到`.git`文件夹，修改`config`文件中的
`remote origin`节点中的 URL 地址
