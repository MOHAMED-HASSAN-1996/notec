
@echo off
set DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
cd /d D:\NOTEC
node node_modules\next\dist\bin\next dev -H 0.0.0.0 -p 3000
