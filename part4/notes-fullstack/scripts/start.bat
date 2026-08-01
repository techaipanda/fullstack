@echo off
REM Windows 启动入口 —— 转发到跨平台核心脚本
setlocal
pushd "%~dp0\.."
node scripts\dev.js start
set "RC=%ERRORLEVEL%"
popd
endlocal & exit /b %RC%
