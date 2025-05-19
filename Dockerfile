# base image
FROM oven/bun:1
WORKDIR /app

ENV NODE_ENV production

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# install dependencies
COPY package.json bun.lockb .
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh


CMD ["/entrypoint.sh"]

