#!/usr/bin/env bash
# ============================================================
# 简历面试AI助手 - 腾讯云轻量服务器一键部署脚本
# 适用：腾讯云轻量应用服务器（2核2G及以上）
# 系统：Ubuntu 22.04 / Debian 12 / CentOS 7+
# ============================================================
set -e

echo "=========================================="
echo "  简历面试AI助手 - 部署脚本"
echo "=========================================="

# ---------- 0. 检查是否root ----------
if [ "$EUID" -ne 0 ]; then
  echo "❌ 请用 root 运行: sudo bash deploy.sh"
  exit 1
fi

# ---------- 1. 系统更新 ----------
echo "▶ 1/7 更新系统..."
apt-get update -y || yum update -y

# ---------- 2. 安装 Docker ----------
echo "▶ 2/7 安装 Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
  echo "✅ Docker 安装完成"
else
  echo "✅ Docker 已存在"
fi

# ---------- 3. 安装 Docker Compose ----------
echo "▶ 3/7 安装 Docker Compose..."
if ! command -v docker compose &>/dev/null; then
  apt-get install -y docker-compose-plugin || {
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    alias docker-compose='docker compose'
  }
  echo "✅ Docker Compose 安装完成"
else
  echo "✅ Docker Compose 已存在"
fi

# ---------- 4. 提示填写配置 ----------
echo "▶ 4/7 检查配置..."
COMPOSE_FILE="$(dirname "$0")/docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ 未找到 docker-compose.yml，请确保与脚本在同一目录"
  exit 1
fi

echo "⚠️  请先编辑 docker-compose.yml，修改以下配置："
echo "   1. POSTGRES_PASSWORD / DATABASE_URL 中的数据库密码"
echo "   2. JWT_SECRET（随机长字符串）"
echo "   3. YUANQI_* 腾讯元器 API 密钥"
echo ""
read -p "  编辑完成后按回车继续..." -r

# ---------- 5. 构建并启动 ----------
echo "▶ 5/7 构建镜像（首次约5-10分钟）..."
cd "$(dirname "$0")"
docker compose build

echo "▶ 6/7 启动服务..."
docker compose up -d

# ---------- 6. 等待健康检查 ----------
echo "▶ 7/7 等待服务启动..."
sleep 10
echo ""

# ---------- 7. 输出访问信息 ----------
IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo "=========================================="
echo "🎉 部署完成！"
echo ""
echo "📍 访问地址: http://$IP:3002"
echo ""
echo "📋 常用命令："
echo "  查看日志:      docker compose logs -f app"
echo "  重启服务:      docker compose restart app"
echo "  停止服务:      docker compose down"
echo "  查看状态:      docker compose ps"
echo ""
echo "📌 如需域名+HTTPS，配置 nginx 反代 3002 端口即可"
echo "=========================================="
