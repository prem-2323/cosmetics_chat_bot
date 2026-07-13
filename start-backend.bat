@echo off
cd /d "%~dp0backend"
echo Starting CosmoGPT Backend...
uvicorn app:app --host 127.0.0.1 --port 8001 --reload
pause
