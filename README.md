# Date A Live AI — Desktop Offline

**Versión del proyecto:** edición local con interfaz cinematográfica, chat con IA y arena de combate RPG  
**Tipo de proyecto:** aplicación local de escritorio mediante navegador  
**Idioma de la interfaz y de las respuestas de IA:** español  
**Estado comprobado:** servidor, interfaz, carga de personajes, persistencia de chats, endpoints de batalla y generación de respuestas con Ollama responden correctamente en la prueba local. La síntesis Piper requiere instalar y configurar sus modelos de voz.

Date A Live AI es un proyecto independiente inspirado en el universo de *Date A Live*. Está desarrollado en Python y presenta una interfaz web local para conocer personajes, mantener conversaciones generadas por un modelo de lenguaje local y participar en combates por turnos.

La aplicación se ejecuta en la propia computadora. FastAPI/Uvicorn ofrece la interfaz y la API en `127.0.0.1:8765`; Ollama proporciona la generación de texto en `127.0.0.1:11434`; SQLite guarda los chats y las batallas guardadas. No se necesita una API de IA de pago.

> **Nota sobre funcionamiento offline:** la aplicación y sus archivos estáticos son locales, pero para conversar con IA se necesita tener Ollama instalado, ejecutándose y con al menos un modelo descargado. Piper requiere además el ejecutable y los modelos de voz locales. La primera descarga de Python, dependencias, Ollama, modelos o recursos puede requerir Internet.

<img width="1280" height="720" alt="Fondo" src="https://github.com/user-attachments/assets/18ebf288-d925-404d-a23c-ca6d2f5b8941" />

## Índice

- [Consignas y objetivos del trabajo](#consignas-y-objetivos-del-trabajo)
- [Funciones incluidas en esta versión](#funciones-incluidas-en-esta-versión)
- [Personajes](#personajes)
- [Tecnologías](#tecnologías)
- [Arquitectura y estructura](#arquitectura-y-estructura)
- [Requisitos](#requisitos)
- [Instalación en Windows](#instalación-en-windows)
- [Configuración de Ollama](#configuración-de-ollama)
- [Uso de la aplicación](#uso-de-la-aplicación)
- [Sistema de batallas](#sistema-de-batallas)
- [Voz y síntesis de voz](#voz-y-síntesis-de-voz)
- [Base de datos y archivos locales](#base-de-datos-y-archivos-locales)
- [API local](#api-local)
- [Pruebas realizadas y estado conocido](#pruebas-realizadas-y-estado-conocido)
- [Solución de problemas](#solución-de-problemas)
- [Compilación para Windows](#compilación-para-windows)
- [Informe final del trabajo](#informe-final-del-trabajo)
- [Privacidad, licencias y aviso legal](#privacidad-licencias-y-aviso-legal)
- [Tohka](#Tohka)
- [Yoshino](#Yoshino)
- [Kurumi](#Kurumi)
- [Kotori](#Kotori)
- [Miku](#Miku)
- [Natsumi](#Natsumi)
- [Origami](#Origami)
- [Nia](#Nia)
- [Mukuro](#Mukuro)
- [Rinne](#Rinne)
- [Canciones-del-repositorio](#Canciones-del-repositorio)

## Consignas y objetivos del trabajo

El objetivo es construir una experiencia interactiva local que combine programación en Python, una interfaz web, persistencia de datos e inteligencia artificial ejecutada en el equipo del usuario.

Las consignas funcionales contempladas en esta versión son:

1. **Aplicación local:** iniciar desde un lanzador Python y abrirse en el navegador, sin desplegar un servidor público.
2. **Experiencia de entrada cinematográfica:** mostrar primero la página de bienvenida con el título y el lema **«Comienza nuestra cita»**; el usuario inicia el opening y puede saltarlo.
3. **Selección de personajes:** mostrar los diez personajes disponibles con imágenes, descripción y estadísticas; permitir ver su presentación y comenzar una conversación.
4. **Chat con IA:** enviar mensajes al personaje elegido y recibir respuestas generadas por Ollama con instrucciones de personalidad y contexto de conversación.
5. **Persistencia:** almacenar conversaciones y mensajes en SQLite para poder volver a abrir los chats.
6. **Interfaz de conversación:** presentar el texto de la charla y un avatar del personaje, con estados visuales asociados a la interacción.
7. **Voz:** ofrecer integración con Piper TTS si están instalados el ejecutable y el modelo de voz correspondiente; el frontend también intenta usar la síntesis de voz del navegador como alternativa.
8. **Batallas RPG:** disponer de una pestaña/pantalla de arena separada del chat, selección de equipos, turnos, ataques, defensa, Ángeles, HP y resolución del combate.
9. **Selecciones persistentes en combate:** conservar el aliado activo y el objetivo elegido entre acciones, permitir cambiarlos y guardar el estado al guardar una partida.
10. **Partidas guardadas:** guardar, cargar y eliminar batallas mediante la base de datos local.
11. **Despedida:** finalizar una cita mostrando el mensaje de despedida del personaje y pasar al video final con **«Vuelve con nosotras»**, con opción de regresar al inicio sin esperar al final del video.
12. **Configuración y mantenimiento:** documentar instalación, modelo local, dependencias y compilación de Windows.

## Funciones incluidas en esta versión

### Bienvenida y videos

- Pantalla de bienvenida con identidad visual de Date A Live AI.
- Lema **«Comienza nuestra cita»** y botón **Comenzar**.
- Reproducción del video `Opening.mp4` después de la acción del usuario.
- Botón para saltar el opening y continuar a la selección.
- Video de presentación individual para los personajes que tienen un archivo de video disponible.
- Despedida de la cita con texto del personaje y paso al cierre cinematográfico.
- Pantalla final con el lema **«Vuelve con nosotras»** y botón **Volver al inicio**.

### Chat de personajes

- Selección de cualquiera de los diez personajes.
- Creación de una nueva charla.
- Historial de chats y reapertura de conversaciones anteriores.
- Envío de mensajes al modelo local de Ollama.
- Instrucciones de sistema específicas por personaje, usando los datos de `data/characters/characters.json`.
- Respuestas en español y etiqueta interna de emoción que la interfaz puede utilizar para presentar el estado del personaje.
- Eliminación de una conversación desde la interfaz.
- Animaciones/estados visuales del avatar durante la interacción.
- Botón de cita que propone una interacción relacionada con una cita.

Las respuestas son generadas por el modelo de lenguaje instalado. Por eso pueden variar entre modelos, ejecuciones y conversaciones; no son diálogos fijos escritos de antemano.

### Arena de batalla RPG

La arena se abre en una pantalla independiente del chat. Permite elegir personajes para ambos bandos y ejecutar un combate por turnos.

- Selección de hasta **cuatro Espíritus por equipo**.
- Tarjetas de personajes con imagen y estadísticas, incluyendo HP, ataque, defensa y velocidad.
- Visualización de los equipos y de sus puntos de vida.
- Selección de un aliado activo para realizar una acción.
- Selección de un objetivo rival.
- El aliado y el objetivo permanecen seleccionados entre acciones cuando siguen disponibles; no hace falta volver a elegirlos después de cada ataque.
- Posibilidad de cambiar de aliado o de objetivo durante el combate.
- Acciones de ataque, uso de Ángel y defensa.
- Turnos y respuestas de los rivales gestionados por la lógica del backend.
- Registro de eventos recientes del combate.
- Detección de victoria o derrota, resultado final y puntaje.
- Opción de iniciar otra batalla.
- Guardado de una partida, listado de partidas guardadas, carga y eliminación.
- El estado guardado incluye la información de la batalla y las selecciones de combatiente/objetivo cuando están definidas.

Los resultados dependen de las estadísticas y de las reglas implementadas; esta función es un sistema de combate inspirado en RPG, no una simulación oficial del canon de la serie.

<img width="1536" height="1024" alt="Instalador Date A Live AI" src="https://github.com/user-attachments/assets/19691af6-ae26-49bd-b036-6e4e0c34bd31" />

## Personajes

Los datos se cargan desde `data/characters/characters.json`. La versión incluye los siguientes diez personajes:

- Tohka
- Yoshino
- Kurumi
- Kotori
- Miku
- Natsumi
- Mukuro
- Nia
- Origami
- Rinne

Las imágenes locales están en `models/Espiritus/` y los videos de presentación y cinemáticas en `models/Videos/`.

## Tecnologías

| Tecnología | Función |
|---|---|
| Python | Lenguaje del backend y del lanzador |
| FastAPI | Rutas HTTP y API local |
| Uvicorn | Servidor ASGI local |
| Ollama | Ejecución de modelos de lenguaje locales |
| SQLite | Almacenamiento de chats, mensajes y batallas guardadas |
| HTML | Estructura de la interfaz |
| CSS | Diseño adaptable, tarjetas, estados visuales y arena |
| JavaScript | Navegación, chat, videos y acciones de combate |
| HTTPX | Solicitudes desde el backend a Ollama |
| Pydantic | Validación de solicitudes recibidas por la API |
| python-dotenv | Lectura opcional de variables desde `.env` |
| Piper TTS | Síntesis de voz local opcional, si se instala y configura |
| API de voz del navegador | Alternativa de voz cuando está disponible en el navegador |

## Arquitectura y estructura

```text
Date-A-Live-main/
├── backend/
│   ├── __init__.py
│   ├── ai.py                 # Integración con Ollama y personalidad de personajes
│   ├── db.py                 # Acceso a SQLite y persistencia
│   └── main.py               # Aplicación FastAPI, chat, TTS y batallas
├── data/
│   ├── characters/
│   │   └── characters.json   # Descripciones, personalidad y estadísticas
│   └── app.db                # Se crea localmente al usar la aplicación
├── desktop/
│   └── launcher.py           # Arranque del servidor y apertura del navegador
├── frontend/
│   ├── index.html            # Pantallas y componentes de la interfaz
│   ├── styles.css            # Estilos
│   └── app.js                # Navegación y lógica de interacción del frontend
├── installer/
│   ├── BUILD_WINDOWS.md      # Pasos para compilar/distribuir
│   ├── DateALiveAI.spec      # Configuración de PyInstaller
│   └── DateALiveAI.iss       # Script de Inno Setup
├── models/
│   ├── Espiritus/            # Imágenes locales de personajes
│   └── Videos/               # Opening, ending y presentaciones
├── scripts/
│   ├── install_dev.bat       # Preparación del entorno
│   └── start_offline.bat     # Lanzador por lotes
├── .env.example              # Plantilla de configuración
├── .gitignore
├── requirements.txt
├── README.md
└── README_CINEMATIC_UI.md
```

La base de datos `data/app.db` se crea automáticamente cuando se inicializa el backend. No es necesario crearla manualmente.

## Requisitos

- Windows 10 u 11 (entorno de desarrollo objetivo).
- Python 3.11 o superior; la versión probada en el equipo de desarrollo fue Python 3.13.
- Ollama instalado y funcionando para el chat con IA.
- Un modelo de Ollama descargado localmente.
- Espacio en disco para el entorno virtual, el modelo de IA y los medios del proyecto.
- Navegador moderno, por ejemplo Microsoft Edge o Google Chrome.
- Opcional: Piper y los modelos de voz `.onnx` correspondientes para síntesis Piper.

El consumo de memoria depende del modelo de Ollama elegido y de los recursos disponibles en el equipo.

## Instalación en Windows

Abrí PowerShell en la carpeta raíz del proyecto.

### 1. Crear el entorno virtual

```powershell
py -m venv .venv
```

### 2. Instalar dependencias

Se recomienda usar directamente el Python del entorno virtual para evitar instalar paquetes en otra instalación de Python:

```powershell
.\.venv\Scripts\python.exe -m pip install --upgrade pip
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### 3. Configurar Ollama

Instalá Ollama y descargá un modelo, como se indica en [Configuración de Ollama](#configuración-de-ollama). Comprobá que el servicio local esté disponible.

### 4. Iniciar la aplicación

```powershell
$env:PYTHONPATH = (Get-Location).Path
.\.venv\Scripts\python.exe desktop\launcher.py
```

Cuando el servidor se inicie, la terminal mostrará una dirección similar a:

```text
Uvicorn running on http://127.0.0.1:8765
```

Abrí `http://127.0.0.1:8765` en el navegador si el lanzador no lo abre automáticamente.

Para detener el servidor, volvé a la terminal y presioná `Ctrl + C`.

**Importante:** si PowerShell bloquea la activación de `.venv`, no es necesario activar el entorno. Los comandos anteriores invocan directamente el ejecutable del entorno virtual.

## Configuración de Ollama

La integración de IA utiliza Ollama a través de su API local. No se requiere una clave de API ni una cuenta de un proveedor de IA de pago.

### Modelo probado en el entorno del proyecto

Durante la prueba local, el modelo disponible fue `llama3.2:3b`.

```powershell
ollama --version
ollama list
ollama pull llama3.2:3b
```

El último comando descarga el modelo si todavía no está instalado. Si ya aparece en `ollama list`, no hace falta descargarlo otra vez.

### Variables de entorno

Copiá `.env.example` a `.env` en la raíz del proyecto y ajustá los valores si lo necesitás:

```dotenv
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
PIPER_BIN=piper
PIPER_MODEL=
HOST=127.0.0.1
PORT=8765
```

- `OLLAMA_URL`: dirección del servicio local de Ollama.
- `OLLAMA_MODEL`: nombre preferido del modelo. El código intenta consultar los modelos instalados y, si el configurado no aparece, selecciona uno disponible.
- `PIPER_BIN`: nombre o ruta del ejecutable de Piper, si se configura.
- `PIPER_MODEL`: variable informativa para la configuración de voz; los modelos que usa esta versión se buscan como archivos `.onnx` por personaje dentro del directorio local de voces previsto por el backend.
- `HOST` y `PORT`: la aplicación está diseñada para ejecutarse en `127.0.0.1:8765`; si se modifica el puerto, hay que mantener coherentes las referencias del lanzador y la aplicación.

No publiques el archivo `.env` ni datos personales. La plantilla `.env.example` sí puede versionarse.

## Uso de la aplicación

1. Iniciá el servidor con `desktop\launcher.py`.
2. En la pantalla inicial, presioná **Comenzar**.
3. Mirá el opening o presioná **Saltar opening**.
4. En la selección, revisá las fichas de los personajes.
5. Usá **Ver presentación** para reproducir el video disponible o **Iniciar chat** para empezar a conversar.
6. En el chat, escribí el mensaje y presioná **Enviar**. La respuesta se genera mediante Ollama.
7. Usá **Nueva charla** para crear una conversación; desde la lista **Mis charlas** podés reabrir o eliminar conversaciones.
8. Usá **Batalla** para entrar en la arena RPG, independiente de la pantalla de chat.
9. Al terminar una cita, el personaje presenta su despedida; continuá para ver el cierre **«Vuelve con nosotras»**.
10. En el cierre, presioná **Volver al inicio** cuando quieras regresar a la bienvenida.

Si una hoja de estilos o el JavaScript parece no actualizarse después de reemplazar archivos, recargá el navegador con `Ctrl + Shift + R`.

## Sistema de batallas

### Preparación

- Elegí hasta cuatro personajes para tu equipo y hasta cuatro para el rival.
- Iniciá el combate una vez seleccionados los equipos.
- Revisá las estadísticas y los puntos de vida de cada unidad.

### Durante el combate

- Seleccioná el combatiente de tu equipo.
- Seleccioná un objetivo rival.
- Ejecutá **Atacar**, **Usar Ángel** o **Defender** según la situación.
- El personaje activo y el objetivo quedan guardados en el estado de batalla mientras sigan siendo válidos.
- Si necesitás cambiar de estrategia, seleccioná otro aliado o un objetivo distinto.
- Si un objetivo queda fuera de combate, la interfaz busca un rival vivo disponible.
- El backend procesa las acciones, el turno enemigo y la condición de finalización.

### Guardar y recuperar

Usá **Guardar** para persistir el estado actual. En **Partidas guardadas** podés cargar o eliminar una partida. La persistencia de la batalla se guarda en SQLite como un estado serializado en JSON.

## Voz y síntesis de voz

El frontend solicita la generación de audio local mediante `POST /api/tts`. El backend puede usar Piper si encuentra el ejecutable y el modelo `.onnx` correspondiente al personaje. La versión distribuida no incluye automáticamente todos los ejecutables ni modelos de voz Piper.

Cuando Piper no está configurado o no tiene una voz para el personaje, el endpoint puede responder `404` indicando que falta el modelo. El frontend intenta entonces recurrir a `speechSynthesis` del navegador, si está disponible. La voz, pronunciación y disponibilidad dependen del sistema operativo, del navegador y de las voces instaladas.

Por lo tanto, **la generación de texto con Ollama está comprobada; la voz Piper es opcional y necesita configuración adicional**. No debe interpretarse la presencia de la integración como que los modelos de voz ya vienen instalados.

## Base de datos y archivos locales

SQLite almacena las conversaciones y los mensajes, además de los registros de batallas guardadas. La base se crea en:

```text
data/app.db
```

Las tablas principales son:

- `chats`: metadatos de las conversaciones.
- `messages`: mensajes de usuario y asistente, emoción y fecha.
- `battles`: tabla histórica disponible para registros de combate.
- `saved_battles`: estados de combate serializados para reanudar partidas.

La base de datos y su contenido permanecen en la carpeta local del proyecto. Hacé una copia de seguridad si querés conservar el historial antes de reemplazar o borrar la carpeta.

## API local

La API se utiliza internamente desde el frontend. Las rutas principales incluyen:

| Método | Ruta | Propósito |
|---|---|---|
| `GET` | `/` | Entregar la interfaz web |
| `GET` | `/api/characters` | Listar personajes y sus datos |
| `GET` | `/api/chats` | Listar conversaciones |
| `POST` | `/api/chats` | Crear una conversación |
| `GET` | `/api/chats/{id}` | Obtener una conversación y sus mensajes |
| `DELETE` | `/api/chats/{id}` | Eliminar una conversación |
| `POST` | `/api/messages` | Enviar un mensaje y obtener respuesta de IA |
| `GET` | `/api/system` | Consultar información del sistema |
| `GET` | `/api/offline` | Consultar la configuración local declarada |
| `GET` | `/api/tts/status` | Consultar disponibilidad de Piper y voces locales |
| `POST` | `/api/tts` | Generar audio con Piper cuando está configurado |
| `POST` | `/api/battles` | Crear un estado inicial de batalla |
| `POST` | `/api/battles/new` | Iniciar una batalla nueva |
| `POST` | `/api/battles/action` | Procesar una acción de combate |
| `GET` | `/api/battles/saved` | Listar partidas guardadas |
| `POST` | `/api/battles/saved` | Guardar una partida |
| `GET` | `/api/battles/saved/{id}` | Cargar una partida guardada |
| `DELETE` | `/api/battles/saved/{id}` | Eliminar una partida guardada |

Estas rutas son una referencia de la API de esta versión y no sustituyen la validación de datos de entrada ni las reglas de la lógica de negocio.

## Pruebas realizadas y estado conocido

La prueba local compartida durante el desarrollo mostró las siguientes respuestas del servidor:

| Comprobación | Evidencia observada | Estado |
|---|---|---|
| Inicio de Uvicorn | `Uvicorn running on http://127.0.0.1:8765` | Correcto |
| Carga de interfaz y recursos | `GET /`, CSS y JavaScript con `200`/`304` | Correcto |
| Recursos multimedia | Videos con `206 Partial Content` e imágenes con `200`/`304` | Correcto |
| API de personajes y chats | `GET /api/characters` y `GET /api/chats` con `200` | Correcto |
| Crear y consultar chat | `POST /api/chats`, `GET /api/chats/{id}` con `200` | Correcto |
| Respuesta del chat con IA | `POST /api/messages` con `200` | Correcto en la prueba compartida |
| Crear batalla | `POST /api/battles` con `200` | Correcto en la prueba compartida |
| Acciones de batalla | Varias llamadas `POST /api/battles/action` con `200` | Correcto en la prueba compartida |
| Guardar/eliminar chat | `DELETE /api/chats/{id}` con `200` | Correcto en la prueba compartida |
| Piper TTS | `POST /api/tts` devolvió `404` al no haber voz Piper configurada | Pendiente de configurar |
| Favicon | `GET /favicon.ico` devolvió `404` | Detalle visual menor; no impide el uso |

En Windows también aparecieron mensajes `ConnectionResetError: [WinError 10054]` cuando el navegador interrumpía solicitudes de video al cambiar de pantalla. En la prueba, el servidor continuó atendiendo solicitudes después de esos mensajes. Son advertencias de conexiones multimedia interrumpidas y no equivalen al fallo de la API de chat.

Las pruebas descritas son las observadas en el registro compartido; no constituyen una certificación exhaustiva de todos los equipos, modelos, navegadores ni casos posibles.

## Solución de problemas

### El navegador muestra una versión anterior

- Confirmá que el servidor se inició desde la carpeta correcta.
- Recargá con `Ctrl + Shift + R`.
- Revisá que el navegador use `http://127.0.0.1:8765`.

### No se puede conectar con Ollama

Comprobá que Ollama esté instalado y que el servicio responda:

```powershell
ollama --version
ollama list
Invoke-WebRequest "http://127.0.0.1:11434/api/tags" -UseBasicParsing
```

Si no hay un modelo instalado, descargá uno, por ejemplo:

```powershell
ollama pull llama3.2:3b
```

Asegurate de que el valor de `OLLAMA_MODEL` corresponda a un modelo disponible. Reiniciá la aplicación después de cambiar `.env`.

### El chat devuelve un error

- Mirá el mensaje de la terminal donde corre Uvicorn.
- Confirmá que Ollama responde en `127.0.0.1:11434`.
- Confirmá que haya al menos un modelo disponible con `ollama list`.
- No publiques logs que contengan datos personales o rutas privadas sin revisarlos.

### No hay voz de Piper

Un `404` de `/api/tts` puede indicar que faltan el ejecutable Piper o el archivo `.onnx` de voz del personaje. Configurá los recursos de Piper o permití que el frontend use la voz del navegador si está disponible.

### PowerShell no permite activar el entorno virtual

No hace falta ejecutar `Activate.ps1`. Usá directamente:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe desktop\launcher.py
```

## Compilación para Windows

Las instrucciones de referencia están en `installer/BUILD_WINDOWS.md`. El proyecto contiene una configuración de PyInstaller (`installer/DateALiveAI.spec`) y un script para Inno Setup (`installer/DateALiveAI.iss`).

La compilación y la distribución como instalador deben probarse en el equipo de destino. Una distribución completamente offline debe incluir o documentar por separado Ollama, el modelo de lenguaje y, si se ofrece voz Piper, el ejecutable y los modelos de voz compatibles, respetando las licencias de cada componente.

## Informe final del trabajo

### Resumen

Se desarrolló una aplicación local inspirada en *Date A Live* que integra una interfaz web con estética cinematográfica, un backend Python, generación de texto con Ollama, persistencia SQLite y un sistema de batalla RPG por turnos. La interfaz se sirve desde el equipo del usuario y permite navegar entre bienvenida, selección de personajes, chat, arena de combate y pantalla de despedida.

### Objetivos alcanzados

- Se implementó el arranque local con FastAPI/Uvicorn y un lanzador de escritorio.
- Se incorporó la secuencia de bienvenida, opening saltables, selección de personajes y cierre con **«Vuelve con nosotras»**.
- Se integraron diez personajes con datos, imágenes y videos locales.
- Se conectó el chat con Ollama para generar respuestas dinámicas con personalidad definida por personaje.
- Se almacenan chats y mensajes en SQLite.
- Se creó una pantalla de combate separada con selección de equipos, combatiente y objetivo, acciones por turnos y resultados.
- Se incorporó el guardado, la carga y la eliminación de partidas de batalla.
- Se documentó la instalación, configuración, API, resolución de problemas y opciones de distribución.

### Resultado de las pruebas

En el registro de ejecución compartido, el servidor inició correctamente, los archivos estáticos y multimedia se sirvieron, los endpoints de personajes y chats respondieron con éxito, `POST /api/messages` devolvió `200 OK` y se ejecutaron varias acciones de batalla con `200 OK`. Esto confirma que los flujos principales de backend probados estaban operativos en ese entorno.

La síntesis Piper no quedó plenamente habilitada en esa prueba: `/api/tts` respondió `404 Not Found` porque no había un modelo de voz configurado para el personaje. El frontend contempla una alternativa mediante la síntesis de voz del navegador, pero su disponibilidad depende del sistema. El `404` del favicon es menor y no impide usar la aplicación. Los avisos `WinError 10054` ocurrieron al interrumpirse conexiones de video y no detuvieron el servicio.

### Limitaciones conocidas

- La calidad, latencia y coherencia de la conversación dependen del modelo local, su tamaño y el hardware disponible.
- Piper necesita instalación y archivos de voz por personaje; esos recursos no se incluyen automáticamente.
- La voz del navegador no garantiza una voz idéntica en todos los equipos.
- Los avisos de conexiones de video interrumpidas pueden aparecer en la consola al cambiar de pantalla.
- La presencia de archivos de compilación no significa que se haya validado un instalador final en todas las configuraciones de Windows.
- Los recursos audiovisuales de la franquicia deben distribuirse únicamente cuando se tenga derecho a hacerlo.

### Conclusión

El resultado es una base funcional de aplicación local que reúne interfaz web, IA local, almacenamiento persistente y combate por turnos. Las pruebas compartidas respaldan el funcionamiento de los flujos principales de chat y batalla. Para cerrar completamente la experiencia de voz, el paso opcional pendiente es instalar y configurar Piper con los modelos `.onnx` apropiados; el resto de los avisos identificados son menores o están asociados a cambios de reproducción multimedia.

## Privacidad, licencias y aviso legal

La aplicación está configurada para ejecutarse en `127.0.0.1`, por lo que no está pensada para exponerse directamente a Internet. La comunicación local con Ollama no requiere una API de IA de pago. La privacidad también depende de la seguridad del equipo, del navegador y de cualquier componente instalado.

No publiques archivos `.env`, bases de datos personales, conversaciones privadas ni credenciales. Antes de distribuir el proyecto, revisá las licencias de los modelos de IA, Piper, voces, imágenes, videos y demás recursos.

*Date A Live*, sus personajes y marcas pertenecen a sus respectivos titulares. Este es un proyecto independiente, no oficial, con fines educativos y personales, sin afiliación con los titulares de derechos. Distribuí únicamente recursos propios o material que tengas autorización para compartir.

## Autor

Proyecto personal / trabajo práctico.

# Tohka

<img width="1366" height="768" alt="Tohka" src="https://github.com/user-attachments/assets/97c24300-057d-488c-942e-883ea9a71743" />

https://github.com/user-attachments/assets/5af09e28-ea62-42ca-8459-f23ee7079d20

# Yoshino

<img width="474" height="266" alt="OIP" src="https://github.com/user-attachments/assets/d4eff442-8d49-4285-9e24-e17f59d8f81d" />

https://github.com/user-attachments/assets/2bb0d0da-5299-41e2-8d8d-2942563adf42

# Kurumi

<img width="474" height="266" alt="OIP (1)" src="https://github.com/user-attachments/assets/cdbef7c4-2822-4ff9-a42d-7dd6cd35b74a" />

https://github.com/user-attachments/assets/84205e85-287f-4d85-9146-f1b3155550c9

# Kotori

<img width="474" height="266" alt="OIP (2)" src="https://github.com/user-attachments/assets/7c07c3f2-7788-47b1-8067-34bf17c23f93" />

https://github.com/user-attachments/assets/eebd144c-26b7-404e-89bd-0176517aec40

# Miku

<img width="1024" height="640" alt="miku_izayoi_date_a_live_by_emilysweet20_dd9mhxd-fullview" src="https://github.com/user-attachments/assets/31ee453c-6ad0-45c9-8258-7ca481e84461" />

https://github.com/user-attachments/assets/5c5e8bfd-fb69-493e-a724-b87cf05a740d

# Natsumi

<img width="474" height="266" alt="OIP" src="https://github.com/user-attachments/assets/c15b5dfd-67d7-4782-93df-9fc14b7ca956" />

https://github.com/user-attachments/assets/9b0126de-3c57-4db3-b98d-02da4dd5e347

# Origami

<img width="2500" height="1235" alt="1051655" src="https://github.com/user-attachments/assets/a36e6cdd-6e07-4bcf-b678-b7319401382c" />

https://github.com/user-attachments/assets/37ff785c-8a9f-49df-8d21-14eafbf81a5a

# Nia

<img width="474" height="266" alt="OIP (1)" src="https://github.com/user-attachments/assets/f9c84ef6-50f6-4cb6-bf44-f542499f5a31" />

https://github.com/user-attachments/assets/a85b321b-86c8-4d71-9d48-a60d2d66d849

# Mukuro

<img width="474" height="266" alt="OIP" src="https://github.com/user-attachments/assets/f980e3dc-be4b-4ec3-b7c3-14183b4857d3" />

https://github.com/user-attachments/assets/f4e1e8b0-e5d1-4875-9351-bd9ae7cb8a84

# Rinne

<img width="736" height="408" alt="ba96c2504b03995a3088bd118cd6c169" src="https://github.com/user-attachments/assets/ecf2940f-7cd5-4142-9dd4-460d04cecbfb" />

https://github.com/user-attachments/assets/44cba572-6d6a-443b-be0e-876f6e81122a

# Canciones del repositorio

https://github.com/user-attachments/assets/330c4400-7884-4209-9253-fdde251e3dfb

https://github.com/user-attachments/assets/5839a936-3f78-41ca-9f2d-4929ab243ab1

https://github.com/user-attachments/assets/a9ab5afe-c5d9-440a-8a38-e5aceac4a308

https://github.com/user-attachments/assets/e24d22c7-3ae2-4a3e-911d-2b8ea581a5ce

https://github.com/user-attachments/assets/8740f071-fcbf-4804-8eae-d37a3a943dc9

https://github.com/user-attachments/assets/ee2d954e-d8ff-4eb4-ac14-92f873c2c839
