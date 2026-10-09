@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\stop-public-tunnel.ps1"
pause
