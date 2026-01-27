#!/usr/bin/env node

/**
 * 测试本地数据库连接脚本
 * 用于排查本地开发环境数据库连接问题
 */

import pg from 'pg';
import dotenv from 'dotenv';

const { Client, Pool } = pg;
dotenv.config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:2345/next-with-hono';

console.log('🔍 数据库连接诊断工具');
console.log('='.repeat(50));
console.log('DATABASE_URL:', DATABASE_URL.replace(/:[^:@]+@/, ':****@'));
console.log('');

// 解析连接字符串
function parseConnectionString(url) {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4]),
    database: match[5],
  };
}

const config = parseConnectionString(DATABASE_URL);

console.log('📊 连接配置:');
console.log('  主机:', config.host);
console.log('  端口:', config.port);
console.log('  数据库:', config.database);
console.log('  用户:', config.user);
console.log('');

// 测试1: 使用 Client
async function testClient() {
  console.log('🧪 测试 1: 使用 Client 连接...');
  const client = new Client({
    ...config,
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const result = await client.query('SELECT NOW(), version()');
    console.log('✅ Client 连接成功！');
    console.log('  时间:', result.rows[0].now);
    console.log('  版本:', result.rows[0].version.split(' ')[0]);
    await client.end();
    return true;
  } catch (error) {
    console.error('❌ Client 连接失败:', error.message);
    console.error('  错误代码:', error.code);
    console.error('  错误详情:', error);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

// 测试2: 使用 Pool
async function testPool() {
  console.log('\n🧪 测试 2: 使用 Pool 连接...');
  const pool = new Pool({
    ...config,
    max: 1,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ Pool 连接成功！');
    console.log('  时间:', result.rows[0].now);
    console.log('  版本:', result.rows[0].version.split(' ')[0]);
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Pool 连接失败:', error.message);
    console.error('  错误代码:', error.code);
    console.error('  错误详情:', error);
    try {
      await pool.end();
    } catch {}
    return false;
  }
}

// 测试3: 使用连接字符串
async function testConnectionString() {
  console.log('\n🧪 测试 3: 使用连接字符串连接...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    connectionTimeoutMillis: 10000,
  });

  try {
    const result = await pool.query('SELECT NOW(), version()');
    console.log('✅ 连接字符串连接成功！');
    console.log('  时间:', result.rows[0].now);
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ 连接字符串连接失败:', error.message);
    console.error('  错误代码:', error.code);
    try {
      await pool.end();
    } catch {}
    return false;
  }
}

// 运行所有测试
async function runTests() {
  const results = {
    client: await testClient(),
    pool: await testPool(),
    connectionString: await testConnectionString(),
  };

  console.log('\n' + '='.repeat(50));
  console.log('📋 测试结果汇总:');
  console.log('  Client:', results.client ? '✅' : '❌');
  console.log('  Pool:', results.pool ? '✅' : '❌');
  console.log('  连接字符串:', results.connectionString ? '✅' : '❌');
  console.log('');

  if (Object.values(results).some(r => r)) {
    console.log('✅ 至少有一种连接方式成功！');
    process.exit(0);
  } else {
    console.log('❌ 所有连接方式都失败了！');
    console.log('\n💡 建议检查:');
    console.log('  1. Docker 容器是否运行: docker-compose ps postgres');
    console.log('  2. 端口是否可访问: nc -zv localhost 2345');
    console.log('  3. 数据库日志: docker-compose logs postgres');
    process.exit(1);
  }
}

runTests().catch(console.error);

