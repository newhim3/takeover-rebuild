@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "%~dp0城邦征战.exe" (
    start "" "%~dp0城邦征战.exe"
    exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\start-local-server.ps1"
if errorlevel 1 pause
