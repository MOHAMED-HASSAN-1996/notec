@echo off
setlocal
cd /d D:\NOTEC
set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000"
node node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3000
