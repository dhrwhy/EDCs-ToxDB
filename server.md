# MouseToxDB 服务器部署文档

## 1. 服务器信息

| 项目 | 信息 |
|------|------|
| 服务器 | Vultr VPS |
| IP 地址 | 167.179.90.24 |
| SSH 连接 | `ssh vultr`（已配置别名，等同于 `ssh root@167.179.90.24`） |
| 操作系统 | Ubuntu 22.04.5 LTS |
| 访问地址 | https://2584256188.work/SDNU/ |
| 域名解析 | Cloudflare DNS → 167.179.90.24 |

### 1.1 服务器环境

| 软件 | 版本 |
|------|------|
| Nginx | 1.18.0 |
| MySQL | 8.0.45 |
| Python | 3.10.12 |
| Node.js | 20.20.0 |
| PHP | 8.1（WordPress 使用） |

### 1.2 同服务器其他服务

服务器同时运行个人 WordPress 博客（`2584256188.work`），MouseToxDB 以 `/SDNU` 子路径部署，两者互不干扰。

---

## 2. 项目目录

```
/root/Web/SDNU/                        # 项目根目录（从本地 rsync/scp 同步）
├── frontend/
│   ├── src/                           # 前端源码（含服务器专用修改，见第 5 节）
│   ├── dist/                          # Vite 构建产物（Nginx 直接服务）
│   ├── node_modules/
│   └── package.json
├── backend/
│   ├── app/                           # FastAPI 后端应用
│   ├── .env                           # 服务器环境变量配置
│   └── requirements.txt
├── database/
│   └── data/
│       └── 260307小鼠双端信息全.xlsx   # 源数据 Excel
├── demo/                              # DESEQ 资源文件（PDF/TXT）
└── data/
    └── statistics/                    # 统计图片目录

/var/www/SDNU → /root/Web/SDNU/frontend/dist   # 符号链接（Nginx 使用）
```

---

## 3. 服务组件

### 3.1 后端服务（systemd）

后端以 systemd service 运行，配置文件：

**`/etc/systemd/system/mousetoxdb.service`**

```ini
[Unit]
Description=MouseToxDB FastAPI Backend
After=network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/Web/SDNU/backend
ExecStart=/usr/bin/python3 -m uvicorn app.main:app --host 127.0.0.1 --port 8001
Restart=always
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

常用命令：

```bash
# 启动 / 停止 / 重启
systemctl start mousetoxdb
systemctl stop mousetoxdb
systemctl restart mousetoxdb

# 查看状态
systemctl status mousetoxdb

# 查看日志
journalctl -u mousetoxdb -f                   # 实时日志
journalctl -u mousetoxdb --since "1h ago"     # 最近 1 小时
```

### 3.2 后端环境变量

**`/root/Web/SDNU/backend/.env`**

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=mousetoxdb
MYSQL_USER=mousetoxdb
MYSQL_PASSWORD=mousetoxdb_pass
ASSETS_DIR=/root/Web/SDNU/demo
EXCEL_PATH=/root/Web/SDNU/database/data/260307小鼠双端信息全.xlsx
STATISTICS_DIR=/root/Web/SDNU/data/statistics
URL_PREFIX=/SDNU
```

### 3.3 Nginx 配置

MouseToxDB 的 Nginx location 配置独立存放，通过 `include` 引入 WordPress 主配置。

**引入位置**：`/etc/nginx/sites-enabled/wordpress` 中 `location /` 之前的 `include /etc/nginx/sites-available/sdnu-locations;`

**`/etc/nginx/sites-available/sdnu-locations`**

```nginx
# MouseToxDB - served under /SDNU path

# Backend API proxy
location ^~ /SDNU/api/ {
    proxy_pass http://127.0.0.1:8001/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 60s;
}

# Static assets (PDF/PNG/TXT)
location ^~ /SDNU/static/assets/ {
    alias /root/Web/SDNU/demo/;
    autoindex off;
    expires 7d;
    add_header Cache-Control "public, no-transform";
}

# Statistics images
location ^~ /SDNU/static/statistics/ {
    alias /root/Web/SDNU/data/statistics/;
    autoindex off;
}

# Frontend static files
location ^~ /SDNU/ {
    root /var/www;
    index index.html;
    try_files $uri $uri/ /SDNU/index.html;
}
```

Nginx 常用命令：

```bash
nginx -t                  # 测试配置语法
systemctl reload nginx    # 重载配置（不中断服务）
systemctl restart nginx   # 重启
```

### 3.4 MySQL

数据库 `mousetoxdb` 已导入数据，MySQL 随系统自动启动。

```bash
# 连接数据库
mysql -u mousetoxdb -pmousetoxdb_pass mousetoxdb

# 查看数据量
SELECT COUNT(*) FROM main_records;   -- 986 条
SELECT COUNT(*) FROM record_assets;  -- 355 条
```

---

## 4. 部署/更新流程

### 4.1 从本地同步代码到服务器

```bash
# 在本地 SDNU 项目目录下执行
# 同步指定文件（推荐，避免覆盖服务器专用修改）
scp frontend/src/pages/Home/index.tsx vultr:/root/Web/SDNU/frontend/src/pages/Home/index.tsx
scp frontend/src/pages/Browse/index.tsx vultr:/root/Web/SDNU/frontend/src/pages/Browse/index.tsx
# ... 其他修改的文件

# 或批量同步整个 src 目录（⚠️ 会覆盖服务器专用修改，需重新打补丁）
rsync -avz frontend/src/ vultr:/root/Web/SDNU/frontend/src/
```

### 4.2 重新打服务器专用补丁

如果 rsync 覆盖了以下文件，需重新应用补丁：

```bash
ssh vultr

# 1. App.tsx: 添加 basename
sed -i 's|<BrowserRouter>|<BrowserRouter basename="/SDNU">|' \
  /root/Web/SDNU/frontend/src/App.tsx

# 2. api/index.ts: 修改 baseURL
sed -i 's|baseURL: "/api"|baseURL: "/SDNU/api"|' \
  /root/Web/SDNU/frontend/src/api/index.ts

# 3. api/download.ts: 添加 /SDNU 前缀
sed -i 's|downloadFile("/api/|downloadFile("/SDNU/api/|g' \
  /root/Web/SDNU/frontend/src/api/download.ts
sed -i 's|`/api/search/export|`/SDNU/api/search/export|' \
  /root/Web/SDNU/frontend/src/api/download.ts
sed -i 's|`/api/assets/|`/SDNU/api/assets/|' \
  /root/Web/SDNU/frontend/src/api/download.ts

# 4. vite.config.ts: 添加 base 路径
sed -i "s|plugins: \[react()\],|plugins: [react()],\n  base: '/SDNU/',|" \
  /root/Web/SDNU/frontend/vite.config.ts

# 5. 移除未使用的 import（避免 TypeScript 编译报错）
sed -i 's/import React, { useEffect, useState, useRef } from "react";/import React, { useEffect, useState } from "react";/' \
  /root/Web/SDNU/frontend/src/pages/Home/index.tsx
```

### 4.3 重新构建前端

```bash
ssh vultr "cd /root/Web/SDNU/frontend && NODE_OPTIONS='--max-old-space-size=1024' npm run build"
```

> **注意**：服务器内存较小（1GB），构建时**必须**设置 `NODE_OPTIONS='--max-old-space-size=1024'`，否则可能 OOM 崩溃。

### 4.4 重启后端（如有后端代码变更）

```bash
ssh vultr "systemctl restart mousetoxdb"
```

### 4.5 完整更新示例

```bash
# 本地执行：同步指定文件 + 打补丁 + 构建 + 重启
scp frontend/src/pages/Home/index.tsx vultr:/root/Web/SDNU/frontend/src/pages/Home/index.tsx && \
ssh vultr "cd /root/Web/SDNU/frontend && \
  sed -i 's/import React, { useEffect, useState, useRef }/import React, { useEffect, useState }/' src/pages/Home/index.tsx && \
  NODE_OPTIONS='--max-old-space-size=1024' npm run build && \
  systemctl restart mousetoxdb && \
  echo 'Deploy done'"
```

---

## 5. 服务器专用修改说明

本地代码与服务器代码存在以下差异（服务器需额外适配 `/SDNU` 子路径）：

| 文件 | 本地（开发） | 服务器（生产） |
|------|-------------|---------------|
| `frontend/vite.config.ts` | `base` 未设置 | `base: '/SDNU/'` |
| `frontend/src/App.tsx` | `<BrowserRouter>` | `<BrowserRouter basename="/SDNU">` |
| `frontend/src/api/index.ts` | `baseURL: "/api"` | `baseURL: "/SDNU/api"` |
| `frontend/src/api/download.ts` | `"/api/download/..."` | `"/SDNU/api/download/..."` |
| `backend/.env` | `URL_PREFIX=`（空） | `URL_PREFIX=/SDNU` |

> 这些修改仅在服务器上生效，**不要提交到 Git**。每次从本地 rsync 覆盖 src 目录后，需重新打补丁（见 4.2 节）。

---

## 6. 注意事项

### 6.1 Nginx 相关

- 所有 SDNU location 使用 `^~` 前缀匹配，确保优先于 WordPress 的 regex location（如 `\.php$`）
- 前端使用 `root /var/www` + 符号链接 `/var/www/SDNU → dist/`。**不能用 `alias` + `try_files`**（Nginx 已知不兼容，`try_files` 会按 `root` 而非 `alias` 解析路径）
- `/root` 目录权限需为 `711`（`chmod 711 /root`），否则 Nginx worker（`www-data`）无法遍历到 `/root/Web/SDNU/demo/` 读取资源文件
- `sdnu-locations` 必须在 WordPress 配置的 `location /` **之前** include，否则 `/SDNU/` 请求会被 WordPress 拦截

### 6.2 构建相关

- 服务器内存 1GB，前端构建**必须**加 `NODE_OPTIONS='--max-old-space-size=1024'`
- 如安装新的 npm 包，需先在服务器执行 `cd /root/Web/SDNU/frontend && npm install <package>`
- 新增 Python 依赖同理：`cd /root/Web/SDNU/backend && pip install <package>`

### 6.3 数据相关

- 数据库数据不会自动更新，更新 Excel 后需重新运行导入脚本：
  ```bash
  cd /root/Web/SDNU/backend
  python3 scripts/import_excel.py
  ```
- 新增 DESEQ 资源文件后，需运行资源扫描更新数据库：
  ```bash
  python3 scripts/scan_assets.py --assets-dir /root/Web/SDNU/demo
  ```

### 6.4 安全相关

- 后端仅监听 `127.0.0.1:8001`，不暴露到公网，所有外部访问通过 Nginx 反向代理
- MySQL 用户 `mousetoxdb` 仅拥有 `mousetoxdb` 数据库权限

### 6.5 故障排查

```bash
# 1. 检查后端是否运行
systemctl status mousetoxdb

# 2. 检查后端日志
journalctl -u mousetoxdb -f

# 3. 检查 Nginx 错误日志
tail -50 /var/log/nginx/error.log

# 4. 检查前端构建产物
ls -la /var/www/SDNU/          # 应指向 dist/，且含 index.html

# 5. 检查 Nginx 配置语法
nginx -t

# 6. 测试后端 API（本地回环）
curl -s http://127.0.0.1:8001/api/health

# 7. 测试完整链路（经 Nginx）
curl -s https://2584256188.work/SDNU/api/health

# 8. 检查符号链接
ls -la /var/www/SDNU

# 9. 检查 /root 目录权限（www-data 需要遍历权限）
stat -c "%a %U" /root          # 应为 711 root
```
