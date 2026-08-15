# 简历面试AI助手 - 腾讯云轻量服务器部署
# 多阶段构建：前端Vite构建 → 后端TS编译 → 生产运行

# ========== 阶段1：构建前端 ==========
FROM node:22-alpine AS frontend-build
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install --include=dev
COPY frontend/ ./
RUN npm run build

# ========== 阶段2：构建后端 ==========
FROM node:22-alpine AS backend-build
WORKDIR /build/backend3
COPY backend3/package*.json ./
RUN npm install
COPY backend3/ ./
RUN npx prisma generate && npm run build

# ========== 阶段3：生产运行 ==========
FROM node:22-alpine
WORKDIR /app

# 安装必要的系统依赖（Prisma需要openssl）
RUN apk add --no-cache openssl bash curl

# 复制后端（含node_modules和编译产物）
COPY --from=backend-build /build/backend3 ./backend3
# 复制前端静态产物
COPY --from=frontend-build /build/frontend/dist ./frontend/dist

WORKDIR /app/backend3

# 上传文件目录（挂载卷）
VOLUME ["/app/backend3/uploads"]

# 暴露后端端口
EXPOSE 3002

# 启动：初始化数据库 → 迁移旧数据 → 种子数据 → 启动服务
CMD ["sh", "-c", "\
  npx prisma db push --accept-data-loss && \
  NODE_ENV=production node dist/index.js \
"]
