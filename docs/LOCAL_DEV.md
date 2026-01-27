# 本地开发环境配置指南

## 问题：本地启动项目无法连接数据库

### 原因分析

本地开发时，应用运行在宿主机上，需要连接到 Docker 容器中的 PostgreSQL。

**关键区别：**
- **Docker 容器内**：使用 `postgres:5432`（Docker 网络服务名）
- **本地开发**：使用 `localhost:2345`（Docker 端口映射）

### 解决方案

#### 1. 确保 Docker 数据库容器正在运行

```bash
# 检查容器状态
docker-compose ps postgres

# 如果未运行，启动数据库容器
docker-compose up -d postgres

# 检查端口映射（应该显示 2345:5432）
docker ps --filter "name=next-with-hono"
```

#### 2. 创建本地开发环境变量文件

创建 `.env.local` 文件（此文件不会被 git 提交）：

```bash
# 复制示例文件
cp env.local.example .env.local
```

或者手动创建 `.env.local` 文件，内容如下：

```env
# 数据库连接（本地开发时连接到 Docker 容器的映射端口）
# 注意：使用 127.0.0.1 而不是 localhost，避免 DNS 解析问题
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:2345/next-with-hono

# Auth 配置
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:6688

# API 配置
NEXT_PUBLIC_API_URL=http://localhost:6688

# Email (Resend) - 可选
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-email@domain.com

# Mastra (可选)
MASTRA_CLOUD_ACCESS_TOKEN=your-mastra-token

# OpenRouter (可选)
OPENROUTER_API_KEY=your-openrouter-key
```

**重要：** `.env.local` 文件已添加到 `.gitignore`，不会被提交到版本控制。

#### 3. 验证数据库连接

```bash
# 测试数据库连接
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:2345/next-with-hono' }); pool.query('SELECT NOW()').then(r => { console.log('✅ 连接成功:', r.rows[0]); pool.end(); }).catch(e => { console.error('❌ 连接失败:', e.message); pool.end(); process.exit(1); });"
```

#### 4. 启动本地开发服务器

```bash
# 启动 Next.js 开发服务器（端口 6688）
pnpm dev
```

应用将在 `http://localhost:6688` 运行。

### 环境变量优先级

Next.js 按以下顺序加载环境变量：

1. `.env.local` - **本地开发使用**（最高优先级，不会被 git 提交）
2. `.env.development` - 开发环境
3. `.env.production` - 生产环境
4. `.env` - 默认环境变量

### 常见问题排查

#### 问题1: `DATABASE_URL is not set`

**原因：** 没有设置环境变量

**解决：**
1. 检查是否存在 `.env.local` 文件
2. 确认文件中有 `DATABASE_URL` 配置
3. 重启开发服务器（环境变量在启动时加载）

#### 问题2: `Connection refused` 或 `ECONNREFUSED`

**原因：** 无法连接到数据库

**解决：**
1. 检查 Docker 容器是否运行：`docker-compose ps postgres`
2. 检查端口映射：`docker ps --filter "name=next-with-hono"`
3. 测试端口连接：`nc -zv localhost 2345`
4. 确认 `DATABASE_URL` 使用 `127.0.0.1:2345`（不是 `localhost:2345` 或 `postgres:5432`）

#### 问题3: `password authentication failed`

**原因：** 密码不匹配

**解决：**
检查 `.env.local` 中的密码是否与 `docker-compose.yml` 中的 `POSTGRES_PASSWORD` 一致（默认都是 `postgres`）

#### 问题4: `database "next-with-hono" does not exist`

**原因：** 数据库未创建

**解决：**
```bash
# 进入数据库容器创建数据库
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE \"next-with-hono\";"
```

#### 问题5: `relation "xxx" does not exist`

**原因：** 数据库迁移未运行

**解决：**
```bash
# 运行数据库迁移
pnpm db:migrate
```

### 快速检查清单

- [ ] Docker 数据库容器正在运行
- [ ] 端口 2345 可访问
- [ ] `.env.local` 文件存在
- [ ] `DATABASE_URL` 指向 `localhost:2345`
- [ ] 数据库迁移已运行
- [ ] 重启开发服务器

### 对比：Docker 环境 vs 本地开发环境

| 环境 | DATABASE_URL | 说明 |
|------|-------------|------|
| **Docker 容器内** | `postgresql://postgres:postgres@postgres:5432/next-with-hono` | 使用 Docker 网络服务名 `postgres` |
| **本地开发** | `postgresql://postgres:postgres@127.0.0.1:2345/next-with-hono` | 使用 `127.0.0.1` 和映射端口 `2345`（避免 DNS 解析问题） |

### 相关文件

- `env.local.example` - 环境变量示例文件
- `.env.local` - 本地开发环境变量（不提交到 git）
- `docker-compose.yml` - Docker 配置（端口映射：2345:5432）
- `db/index.ts` - 数据库连接配置

