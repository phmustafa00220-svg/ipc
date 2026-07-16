@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules" (
  echo Installing dependencies...
  call npm install
)
if not exist "dist" (
  echo Building production files...
  call npm run build
)
echo Starting HIHFAD IPC Primary Station...
echo Open: http://127.0.0.1:3035
start "" "http://127.0.0.1:3035"
call npm start
