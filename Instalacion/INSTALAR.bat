@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0instalar.ps1"
if errorlevel 1 (
  echo.
  echo La instalacion no pudo completarse.
  echo Revisa data\install.log para ver el detalle.
  pause
  exit /b 1
)
exit /b 0
