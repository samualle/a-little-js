# MySQL 5.7 二进制包安装

### MySQL 5.7 安装注意事项

> 1. 在 `MySQL` 中已经不再推荐使用 `mysql_install_db` 了，建议改为使用 `mysqld --initialize` 完成实例的初始化。`mysql_install_db` 在 `/mysql/bin` 目录下，同时取消了 `/mysql/scripts` 目录。
> 2. 初始化时如果加上 `--initialize-insecure`，则会创建空密码的 `root@localhost` 账号，否则会创建带初始密码的账号，密码直接写在 `log-error` 日志文件中。
> 3. `MySQL 5.7` 的安装过程与 `MySQL 5.6` 的区别主要在于数据库的初始化过程。

### MySQL 5.7 安装

#### 相关依赖
系统在初始化时一般已经安装了足够的依赖包，下面一些必要的依赖
```sh
yum -y groupinstall "Development tools"
yum -y install ncurses ncurses-devel openssl-devel bison gcc gcc-c++ make
yum -y install libaio
yum -y install net-tools
yum -y install wget
```

#### 技术环境
平台： `VMware Fusion 专业版 11.5.5 (16269456)`  
系统：`CentOS 7`  
内核：`Kernel 3.10.0-1127.13.1.el7.x86_64`  

#### MySQL 安装
官网链接：[mysql-5.7.28-linux-glibc2.12-x86_64.tar.gz][mysql5728]
```sh
# 下载安装包
wget https://cdn.mysql.com//Downloads/MySQL-5.7/mysql-5.7.28-linux-glibc2.12-x86_64.tar.gz

# 如果服务器无法连接外网，或者网速受限，可下载到本地，然后上传到服务器，SCP 为可选方式之一
# scp path/file user@host:path
# -r 递归读取目录，用于上传文件夹
# -P 指定上传时用到的端口，默认端口可省略
scp Downloads/mysql-5.7.28-linux-glibc2.12-x86_64.tar.gz root@172.16.60.132:/root

# 解压安装包
tar zxvf mysql-5.7.28-linux-glibc2.12-x86_64.tar.gz

# 拷贝到指定目录
cp -rf mysql-5.7.28-linux-glibc2.12-x86_64 /usr/local/mysql-5.7.28

# 创建用户相关
group add mysql
useradd -r -g mysql -s /bin/false mysql
# OR
useradd -s /sbin/nologin -M mysql

# 创建软连接
cd /usr/local
ln -s mysql-5.7.28 mysql

# 添加环境变量
vim /etc/profile
# =====
export PATH=/usr/local/mysql/bin:$PATH
export PATH=/usr/local/mysql/lib:$PATH
# =====
source /etc/profile

# 创建 MySQL 运行相关目录
mkdir -p /usr/local/mysql/{data,tmp,logs,pids}
chown mysql.mysql /usr/local/mysql/data
chown mysql.mysql /usr/local/mysql/tmp
chown mysql.mysql /usr/local/mysql/logs
chown mysql.mysql /usr/local/mysql/pids

# 修改/etc/my.cnf文件，编辑配置文件如下
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
datadir=/usr/local/mysql/data
socket=/usr/local/mysql/tmp/mysql.sock
[mysqld_safe]
log-error=/usr/local/mysql/logs/mysqld.log
pid-file=/usr/local/mysql/pids/mysqld.pid
[client]
default-character-set=utf8mb4

# 创建mysqld.log 和 mysqld.pid文件
touch /usr/local/mysql/logs/mysqld.log
touch /usr/local/mysql/pids/mysqld.pid
chown mysql.mysql -R /usr/local/mysql/logs/
chown mysql.mysql -R /usr/local/mysql/pids/

# 加入守护进程
cd /usr/local/mysql
# =====
cp support-files/mysql.server /etc/init.d/mysqld
chmod +x /etc/init.d/mysqld
# =====
chkconfig --add mysqld
chkconfig mysqld on
# OR
systemctl enable mysqld
systemctl start mysqld

# 初始化数据库，–initialize 表示默认生成一个安全的密码，–initialize-insecure 表示不生成密码
mysqld --initialize-insecure --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data

# 启动MySQL
service mysqld start
# OR
systemctl start mysqld
# OR
mysql_safe --user=mysql --datadir=/usr/local/mysql/data &

# 第一次登陆不需要密码，回车即可
ln -s /usr/local/mysql/tmp/mysql.sock /tmp/mysql.sock
mysql -u root -p

# 修改密码
set password for root@localhost = password('123456');
# OR
use mysql;
update user set authentication_string=password('123456') where user='root' and host='localhost';
flush privileges;

```

### /etc/my.cnf 的配置
```ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_general_ci
datadir=/usr/local/mysql/data
socket=/usr/local/mysql/tmp/mysql.sock

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0
# Settings user and group are ignored when systemd is used.
# If you need to run mysqld under a different user or group,
# customize your systemd unit file for mariadb according to the
# instructions in http://fedoraproject.org/wiki/Systemd

[mysqld_safe]
log-error=/usr/local/mysql/logs/mysqld.log
pid-file=/usr/local/mysql/pids/mysqld.pid

[client]
default-character-set=utf8mb4
#
# include all files from the config directory
#
!includedir /etc/my.cnf.d
```

> #### 参考
> [编程客栈][cppcns] : [CentOS7编译安装MySQL5.7.24的教程详解][mysql246548]
>
>

[mysql5728]:
https://cdn.mysql.com//Downloads/MySQL-5.7/mysql-5.7.28-linux-glibc2.12-x86_64.tar.gz

[cppcns]:
http://www.cppcns.com
[mysql246548]:
http://www.cppcns.com/shujuku/mysql/246548.html
