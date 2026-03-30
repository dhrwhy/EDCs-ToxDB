# 配置文件说明

本目录存放 EDC-ToxDB 数据库的环境配置和 Docker 编排文件。

## 文件清单

### .env.example — 环境变量模板

数据库连接和文件路径的配置模板。使用时复制为 `.env` 并修改。

```bash
cp .env.example .env
```

**变量说明：**

| 变量 | 默认值 | 说明 |
|------|--------|------|
| MYSQL_ROOT_PASSWORD | root_pass | MySQL root 密码 |
| MYSQL_DATABASE | mousetoxdb | 数据库名 |
| MYSQL_USER | mousetoxdb | 数据库用户名 |
| MYSQL_PASSWORD | mousetoxdb_pass | 数据库用户密码 |
| MYSQL_HOST | localhost | MySQL 主机地址 |
| MYSQL_PORT | 3306 | MySQL 端口 |
| EXCEL_PATH | *(项目中的 Excel 路径)* | Excel 数据文件路径 |
| ASSETS_DIR | *(项目中的 demo 路径)* | 资源文件目录路径 |

> Docker 部署时需将 `MYSQL_HOST` 改为 `mysql`（容器名），路径改为容器内路径。

### docker-compose.mysql.yml — MySQL Docker 独立配置

仅包含 MySQL 服务，供数据库单独调试使用。

**使用方式：**

```bash
# 启动
docker compose -f docker-compose.mysql.yml up -d

# 连接
docker compose -f docker-compose.mysql.yml exec mysql \
  mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb

# 停止
docker compose -f docker-compose.mysql.yml down

# 停止并删除数据
docker compose -f docker-compose.mysql.yml down -v
```

**特性：**
- 自动使用 `sql/001_create_tables.sql` 初始化表结构（通过 Docker 的 `initdb.d` 机制）
- 字符集 utf8mb4，排序规则 utf8mb4_general_ci
- 数据持久化到 Docker Volume `mysql_data`
- 端口映射 3306:3306
- 健康检查：每 10 秒 ping 一次，最多重试 5 次
