#!/bin/sh
set -e

echo "Running database schema push..."
npx drizzle-kit push --force
echo "Database schema ready."

echo "Starting backend server..."
exec npx tsx src/index.ts
