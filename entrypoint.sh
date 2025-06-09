#!/bin/sh

echo "Prisma Migrasi Running"
bunx prisma migrate deploy

echo "Test Data"
bun test ./test/test-cron.ts


echo "Starting the server!"
bun run src/index.ts