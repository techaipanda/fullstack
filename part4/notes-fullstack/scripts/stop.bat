@echo off
REM Windows 停止入口 —— 转发到跨平台核心脚本
setlocal
pushd "%~dp0\.."
node scripts\dev.js stop
set "RC=%ERRORLEVEL%"
popd
endlocal & exit /b %RC%
