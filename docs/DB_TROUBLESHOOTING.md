# 数据库连接排查指南

## 当前状态

✅ **数据库容器运行正常**
- PostgreSQL 16.11 正在运行
- 健康检查通过
- 端口映射：2345:5432

✅ **数据库连接测试成功**
- 从应用容器可以连接到数据库
- 表结构已存在（7个表）

## 常见问题排查

### 1. 检查环境变量

```bash
# 在容器内检查
docker-compose exec app sh -c 'echo $DATABASE_URL'

# 应该显示：
# postgresql://postgres:postgres@postgres:5432/next-with-hono
```

### 2. 测试数据库连接

```bash
# 方法1：使用 Node.js 直接测试
docker-compose exec app sh -c 'cd /app && node -e "const { Pool } = require(\"pg\"); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query(\"SELECT NOW()\").then(r => { console.log(\"✅ OK:\", r.rows[0]); pool.end(); }).catch(e => { console.error(\"❌ Error:\", e.message); pool.end(); process.exit(1); });"'

# 方法2：使用 psql 客户端
docker-compose exec postgres psql -U postgres -d next-with-hono -c "SELECT NOW();"
```

### 3. 检查数据库表

```bash
docker-compose exec postgres psql -U postgres -d next-with-hono -c "\dt"
```

应该看到以下表：
- account
- invitation
- member
- organization
- session
- user
- verification

### 4. 检查应用日志

```bash
# 查看应用日志
docker-compose logs app --tail=100

# 查找数据库相关错误
docker-compose logs app | grep -i "database\|error\|connection"
```

### 5. 检查网络连接

```bash
# 从应用容器 ping 数据库容器
docker-compose exec app ping -c 3 postgres

# 测试端口连接
docker-compose exec app nc -zv postgres 5432
```

## 数据库连接配置

### db/index.ts

已优化配置：
- ✅ 环境变量检查
- ✅ 连接池配置（max: 20, timeout: 2s）
- ✅ 错误监听
- ✅ 连接测试日志

### docker-compose.yml

数据库配置：
```yaml
DATABASE_URL: postgresql://postgres:postgres@postgres:5432/next-with-hono
```

**注意：**
- `postgres` 是 Docker 网络中的服务名
- 端口 `5432` 是容器内部端口（不是映射的 2345）
- 数据库名：`next-with-hono`

## 常见错误及解决方案

### 错误1: `DATABASE_URL is not set`

**原因：** 环境变量未设置

**解决：**
```bash
# 检查环境变量
docker-compose exec app sh -c 'echo $DATABASE_URL'

# 如果为空，检查 docker-compose.yml 中的 environment 配置
```

### 错误2: `Connection refused` 或 `ECONNREFUSED`

**原因：** 无法连接到数据库服务器

**解决：**
1. 检查数据库容器是否运行：`docker-compose ps postgres`
2. 检查网络连接：`docker-compose exec app ping postgres`
3. 确认服务名正确（应该是 `postgres`，不是 `localhost`）

### 错误3: `password authentication failed`

**原因：** 密码不匹配

**解决：**
检查 `docker-compose.yml` 中的密码配置：
- POSTGRES_PASSWORD: postgres
- DATABASE_URL 中的密码应该匹配

### 错误4: `database "next-with-hono" does not exist`

**原因：** 数据库未创建

**解决：**
```bash
# 创建数据库
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE \"next-with-hono\";"
```

### 错误5: `relation "xxx" does not exist`

**原因：** 数据库迁移未运行

**解决：**
```bash
# 运行迁移（需要在本地运行，因为容器中没有 drizzle-kit）
pnpm db:migrate

# 或者在本地运行后，重启应用容器
docker-compose restart app
```

## 本地开发环境

如果是在本地开发（非 Docker），需要设置：

```bash
# .env.local 或 .env
DATABASE_URL=postgresql://postgres:postgres@localhost:2345/next-with-hono
```

注意：本地开发时使用 `localhost:2345`（Docker 映射的端口）

## 生产环境

生产环境建议：
1. 使用强密码
2. 使用环境变量管理敏感信息
3. 配置 SSL 连接
4. 使用连接池监控

## 调试命令

```bash
# 1. 检查容器状态
docker-compose ps

# 2. 查看数据库日志
docker-compose logs postgres --tail=50

# 3. 查看应用日志
docker-compose logs app --tail=50

# 4. 进入数据库容器
docker-compose exec postgres sh

# 5. 进入应用容器
docker-compose exec app sh

# 6. 重启服务
docker-compose restart app
docker-compose restart postgres

# 7. 完全重建（会删除数据）
docker-compose down -v
docker-compose up -d --build
```

