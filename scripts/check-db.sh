#!/bin/bash

echo "🔍 Database Connection Diagnostic Tool"
echo "======================================"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable is not set"
  exit 1
fi

# Mask password in URL for display
SAFE_URL=$(echo "$DATABASE_URL" | sed 's/:[^:@]*@/:****@/')
echo "📋 DATABASE_URL: $SAFE_URL"
echo ""

# Extract connection details
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "📊 Connection Details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo ""

# Test connection using node
echo "🧪 Testing connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT NOW() as time, version() as version')
  .then(result => {
    console.log('✅ Connection successful!');
    console.log('  Time:', result.rows[0].time);
    console.log('  Version:', result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]);
    
    return pool.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name\");
  })
  .then(result => {
    console.log('');
    console.log('📊 Tables (' + result.rows.length + '):');
    result.rows.forEach(row => {
      console.log('  -', row.table_name);
    });
    pool.end();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection failed!');
    console.error('  Error:', err.message);
    console.error('  Code:', err.code);
    pool.end();
    process.exit(1);
  });
"

