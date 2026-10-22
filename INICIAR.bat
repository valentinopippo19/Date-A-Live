@echo off
setlocal
cd /d "%~dp0"
call "%~dp0Instalacion\INSTALAR.bat"
if errorlevel 1 exit /b %errorlevel%
call "%~dp0Instalacion\EJECUTAR.bat"
endlocal
