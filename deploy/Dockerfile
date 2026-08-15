# 简历面试AI助手 - 腾讯云轻量服务器部署
# 多阶段构建：前端Vite构建 → 后端TS编译 → 生产运行
# 注意：使用 node:22-slim（Debian/glibc），因为 Vite/rollup 需要 glibc，alpine(musl) 不兼容

# ========== 阶段1：构建前端 ==========
FROM node:22-slim AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install --include=dev
COPY frontend/ ./
RUN npm run build

# ========== 阶段2：构建后端 ==========
FROM node:22-slim AS backend-build
WORKDIR /build/backend3
# 先复制 package.json 安装依赖（跳过 postinstall 的 prisma generate）
COPY backend3/package*.json ./
RUN npm install --ignore-scripts
# 再复制全量代码（含 prisma/schema.prisma）
COPY backend3/ ./
# 此时 schema 已就位，再执行 prisma generate
RUN npx prisma generate && npm run build

# ========== 阶段3：生产运行 ==========
FROM node:22-slim
WORKDIR /app

# 安装必要的系统依赖（Prisma需要openssl）
RUN apt-get update && apt-get install -y --no-install-recommends openssl curl && rm -rf /var/lib/apt/lists/*

# 复制后端（含node_modules和编译产物）
COPY --from=backend-build /build/backend3 ./backend3
# 复制前端静态产物
COPY --from=frontend-build /build/frontend/dist ./frontend/dist

WORKDIR /app/backend3

# 上传文件目录（挂载卷）
VOLUME ["/app/backend3/uploads"]

# 暴露后端端口
EXPOSE 3002

# 启动：初始化数据库 → 启动服务
CMD ["sh", "-c", "\
  npx prisma db push --accept-data-loss && \
  NODE_ENV=production node dist/index.js \
"]
