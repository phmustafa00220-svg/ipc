@echo off
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Please right-click this file and choose Run as administrator.
  pause
  exit /b 1
)
netsh advfirewall firewall add rule name="HIHFAD IPC Primary Station" dir=in action=allow protocol=TCP localport=3035
echo Firewall rule added for port 3035.
pause
