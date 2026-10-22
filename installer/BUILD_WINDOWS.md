# Build Windows

## Distribución ZIP recomendada

La distribución más simple para este proyecto es el ZIP completo. El usuario ejecuta `INICIAR.bat` en la raíz. El bootstrap de `Instalacion/instalar.ps1` prepara Python, `.venv`, dependencias, Ollama, el modelo, Piper y la voz española.

No se incluye `.venv` en el ZIP de distribución porque un entorno virtual es específico de la máquina y de la versión de Python. Se crea automáticamente en la PC del usuario.

## Desarrollo

Para preparar una copia local:

```bat
INICIAR.bat
```

Para ejecutar directamente el servidor desde Visual Studio/Python:

```bat
RUN_VISUAL.bat
```

El servidor abre `http://127.0.0.1:8765`.

## EXE con PyInstaller + Inno Setup

Se mantienen `DateALiveAI.spec` y `DateALiveAI.iss` como base para una futura distribución EXE. El EXE de la aplicación no elimina la necesidad de preparar Ollama y Piper; por eso el instalador final debe conservar el bootstrap de `Instalacion/instalar.ps1` o ejecutar una lógica equivalente.
