@echo off
setlocal
cd /d "%~dp0.."
if not exist ".venv\Scripts\python.exe" (
  echo El entorno no esta instalado. Ejecuta INICIAR.bat.
  pause
  exit /b 1
)
set "OLLAMA_URL=http://127.0.0.1:11434"
set "OLLAMA_MODEL=llama3.2:1b"
start "Date A Live AI" /D "%~dp0.." "%~dp0..\.venv\Scripts\python.exe" "%~dp0..\desktop\launcher.py"
endlocal
