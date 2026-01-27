#!/bin/bash

# Docker 部署脚本
# 使用方法: ./deploy.sh [build|start|stop|restart|logs|clean]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
}

# 构建镜像
build() {
    info "开始构建 Docker 镜像..."
    docker-compose build --no-cache
    info "构建完成！"
}

# 启动服务
start() {
    info "启动服务..."
    docker-compose up -d
    info "等待服务启动..."
    sleep 5
    
    # 检查服务状态
    if docker-compose ps | grep -q "Up"; then
        info "服务已启动！"
        info "应用地址: http://localhost:7788"
    else
        error "服务启动失败，请查看日志: docker-compose logs"
        exit 1
    fi
}

# 停止服务
stop() {
    info "停止服务..."
    docker-compose down
    info "服务已停止"
}

# 重启服务
restart() {
    info "重启服务..."
    docker-compose restart
    info "服务已重启"
}

# 查看日志
logs() {
    docker-compose logs -f app
}

# 清理（停止并删除容器、网络、数据卷）
clean() {
    warn "这将删除所有容器、网络和数据卷！"
    read -p "确认继续? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        info "清理中..."
        docker-compose down -v
        docker system prune -f
        info "清理完成"
    else
        info "已取消"
    fi
}

# 运行数据库迁移
migrate() {
    info "运行数据库迁移..."
    docker-compose exec app pnpm db:migrate
    info "迁移完成"
}

# 显示状态
status() {
    info "服务状态:"
    docker-compose ps
    
    echo ""
    info "容器资源使用:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" $(docker-compose ps -q)
}

# 主函数
main() {
    check_docker
    
    case "${1:-help}" in
        build)
            build
            ;;
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        logs)
            logs
            ;;
        clean)
            clean
            ;;
        migrate)
            migrate
            ;;
        status)
            status
            ;;
        help|*)
            echo "使用方法: ./deploy.sh [command]"
            echo ""
            echo "命令:"
            echo "  build     - 构建 Docker 镜像"
            echo "  start     - 启动服务"
            echo "  stop      - 停止服务"
            echo "  restart   - 重启服务"
            echo "  logs      - 查看日志"
            echo "  migrate   - 运行数据库迁移"
            echo "  status    - 查看服务状态"
            echo "  clean     - 清理所有容器和数据（危险操作）"
            echo "  help      - 显示此帮助信息"
            ;;
    esac
}

main "$@"

