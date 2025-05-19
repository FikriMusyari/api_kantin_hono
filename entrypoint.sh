#!/bin/sh

echo "Prisma Migrasi Running"
bunx prisma migrate deploy


echo "Starting the server!"
bun run src/index.ts