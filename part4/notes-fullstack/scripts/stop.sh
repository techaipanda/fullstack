#!/usr/bin/env bash
# macOS / Linux 停止入口 —— 转发到跨平台核心脚本
set -e
cd "$(dirname "$0")/.."
exec node scripts/dev.js stop
