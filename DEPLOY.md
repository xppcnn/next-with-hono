# Docker 部署指南

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 2GB 可用内存

## 快速开始

### 1. 环境变量配置

创建 `.env` 文件（可选，docker-compose.yml 中有默认值）：

```bash
# Database (默认使用 docker-compose 中的 postgres)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/next-with-hono

# Auth
BETTER_AUTH_SECRET=your-secret-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:7788

# API
NEXT_PUBLIC_API_URL=http://localhost:7788

# Email (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=your-email@domain.com

# Mastra (可选)
MASTRA_CLOUD_ACCESS_TOKEN=your-mastra-token

# OpenRouter (可选)
OPENROUTER_API_KEY=your-openrouter-key

# App Port
APP_PORT=7788
```

### 2. 构建和启动

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f app

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

### 3. 数据库迁移

首次部署需要运行数据库迁移：

```bash
# 进入容器
docker-compose exec app sh

# 运行迁移
pnpm db:migrate
```

或者使用 docker-compose 直接执行：

```bash
docker-compose exec app pnpm db:migrate
```

## 单独使用 Dockerfile

### 构建镜像

```bash
docker build \
  --build-arg RESEND_API_KEY=your-key \
  --build-arg RESEND_FROM_EMAIL=your-email@domain.com \
  -t next-with-hono:latest .
```

### 运行容器

```bash
docker run -d \
  --name next-with-hono-app \
  -p 7788:3000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e BETTER_AUTH_SECRET=your-secret \
  -e BETTER_AUTH_URL=http://localhost:7788 \
  -e NEXT_PUBLIC_API_URL=http://localhost:7788 \
  -e RESEND_API_KEY=your-key \
  -e RESEND_FROM_EMAIL=your-email@domain.com \
  -e NODE_ENV=production \
  next-with-hono:latest
```

## 生产环境部署建议

### 1. 安全配置

- ✅ 更改 `BETTER_AUTH_SECRET` 为强随机字符串
- ✅ 使用 HTTPS（配置反向代理如 Nginx）
- ✅ 限制数据库访问权限
- ✅ 使用环境变量管理敏感信息

### 2. 性能优化

- ✅ 使用多阶段构建（已实现）
- ✅ 启用 Next.js 输出缓存
- ✅ 配置 CDN 用于静态资源
- ✅ 使用 Redis 进行会话存储（可选）

### 3. 监控和日志

```bash
# 查看容器日志
docker-compose logs -f app

# 查看容器资源使用
docker stats next-with-hono-app

# 进入容器调试
docker-compose exec app sh
```

### 4. 健康检查

应用包含健康检查端点（如果配置了 `/api/health`）：

```bash
curl http://localhost:7788/api/health
```

## 故障排查

### 容器无法启动

1. 检查日志：`docker-compose logs app`
2. 确认端口未被占用：`lsof -i :7788`
3. 检查环境变量是否正确设置

### 数据库连接问题

1. 确认 postgres 容器正常运行：`docker-compose ps`
2. 检查数据库连接字符串格式
3. 确认网络连接：`docker-compose exec app ping postgres`

### 构建失败

1. 清理构建缓存：`docker-compose build --no-cache`
2. 检查 `.dockerignore` 是否正确配置
3. 确认所有依赖文件都已复制

## 更新应用

```bash
# 拉取最新代码
git pull

# 重新构建
docker-compose build

# 重启服务
docker-compose up -d

# 运行迁移（如果需要）
docker-compose exec app pnpm db:migrate
```

## 备份和恢复

### 备份数据库

```bash
docker-compose exec postgres pg_dump -U postgres next-with-hono > backup.sql
```

### 恢复数据库

```bash
docker-compose exec -T postgres psql -U postgres next-with-hono < backup.sql
```

## 端口说明

- **7788**: Next.js 应用端口（可通过 `APP_PORT` 环境变量修改）
- **2345**: PostgreSQL 数据库端口（仅用于本地连接）

## 网络架构

```
Internet
   ↓
[Reverse Proxy / Nginx] (可选)
   ↓
[Next.js App :7788]
   ↓
[PostgreSQL :5432]
```

## 支持

如有问题，请查看：
- [Docker 文档](https://docs.docker.com/)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Docker Compose 文档](https://docs.docker.com/compose/)

