# Date A Live AI — instalación y ejecución en Windows

## Usuario final

1. Descomprimí el ZIP completo en una carpeta con permisos de escritura.
2. Ejecutá **`INICIAR.bat`** que está en la raíz del proyecto.
3. La primera ejecución prepara automáticamente:
   - Python compatible y `.venv` en la raíz del proyecto.
   - Dependencias de FastAPI/Uvicorn/HTTPX/etc.
   - Ollama y el modelo `llama3.2:1b`.
   - Piper TTS para Windows x64.
   - Voz española `es_MX-ald-medium`.
   - `.env` local.
4. El navegador se abre automáticamente en **http://127.0.0.1:8765**.
5. Las siguientes ejecuciones pueden hacerse con **`EJECUTAR.bat`**.

La carpeta `Instalacion` contiene únicamente los archivos de instalación/arranque. Los componentes reales quedan en las carpetas del proyecto: `.venv`, `runtime/piper`, `models/voices`, `data`, `backend`, `frontend` y `models`.

## Desarrollo / Visual Studio

Desde Visual Studio se puede ejecutar `desktop/launcher.py` con el directorio de trabajo establecido en la raíz `Date-A-Live-main`. Si el entorno todavía no existe, ejecutá primero `INICIAR.bat` o `scripts/install_dev.bat`.

También se incluye **`RUN_VISUAL.bat`**, que prepara el entorno si hace falta y ejecuta el mismo servidor local.

## Rutas importantes

```text
Date-A-Live-main/
├── backend/                 # FastAPI + Ollama + TTS + batallas
├── frontend/                # panel web
├── desktop/launcher.py      # arranque local
├── data/                    # SQLite y datos persistentes
│   ├── app.db
│   └── characters/
├── models/                  # imágenes, videos y voces
│   ├── Espiritus/
│   ├── Videos/
│   └── voices/
├── runtime/piper/            # piper.exe + librerías del runtime
├── .venv/                   # entorno Python de esa PC
├── Instalacion/             # scripts de instalación, NO es el directorio raíz
├── INICIAR.bat
├── EJECUTAR.bat
├── RUN_VISUAL.bat
└── requirements.txt
```

## Funcionamiento local

- Panel web: `127.0.0.1:8765`
- Ollama: `127.0.0.1:11434`
- Base de datos: `data/app.db`
- Piper: `runtime/piper/piper.exe`
- Voz: `models/voices/es_MX-ald-medium.onnx`

El servidor escucha solamente en `127.0.0.1`, por lo que el panel no queda publicado en Internet. Para conversar con la IA se necesita Ollama y un modelo local; después de descargar los recursos, la aplicación puede funcionar sin servicios de IA externos.

## Si algo falla

Revisá primero:

```text
data/install.log
```

y ejecutá nuevamente `INICIAR.bat`. El instalador es idempotente: conserva lo que ya existe y completa lo que falte.

## Requisitos

- Windows 10/11 de 64 bits.
- Internet durante la primera instalación.
- Espacio libre suficiente para Python, dependencias, Ollama, modelo y recursos multimedia.
- Permisos normales de usuario para la carpeta donde se descomprime el proyecto. Ollama puede mostrar su propio aviso de Windows durante la instalación.
