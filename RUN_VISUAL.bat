@echo off
setlocal
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Preparando el entorno de desarrollo...
  call "%~dp0Instalacion\INSTALAR.bat"
  if errorlevel 1 exit /b %errorlevel%
)
set "OLLAMA_URL=http://127.0.0.1:11434"
set "OLLAMA_MODEL=llama3.2:1b"
"%~dp0.venv\Scripts\python.exe" "%~dp0desktop\launcher.py"
endlocal
