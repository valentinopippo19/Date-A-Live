$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$InstallDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $InstallDir
$LogDir = Join-Path $InstallDir "data"
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
$LogFile = Join-Path $LogDir "install.log"

function Log($msg) {
    $line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $msg"
    Write-Host $line
    Add-Content -LiteralPath $LogFile -Value $line -Encoding UTF8
}
function Fail($msg) {
    Log "ERROR: $msg"
    Write-Host ""
    Write-Host "La instalacion no pudo completarse." -ForegroundColor Red
    Write-Host "Detalle: $msg" -ForegroundColor Red
    Write-Host "Log: $LogFile" -ForegroundColor Yellow
    exit 1
}
function Find-CommandPath($name) {
    $c = Get-Command $name -ErrorAction SilentlyContinue
    if ($c) { return $c.Source }
    return $null
}

try {
    Log "=== Inicio de instalacion Date A Live AI ==="
    if (-not $IsWindows -and [System.Environment]::OSVersion.Platform -ne 'Win32NT') { Fail "Este paquete esta preparado para Windows." }
    if (-not [Environment]::Is64BitOperatingSystem) { Fail "Se requiere Windows de 64 bits." }

    Log "Comprobando Internet..."
    try { Invoke-WebRequest "https://ollama.com" -UseBasicParsing -TimeoutSec 15 | Out-Null } catch { Fail "No hay acceso a Internet. La primera instalacion necesita Internet." }

    # Python
    $python = Find-CommandPath "python.exe"
    if (-not $python) { $python = Find-CommandPath "py.exe" }
    $needPython = $true
    if ($python -and (Test-Path $python)) {
        try {
            $ver = & $python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
            $parts = $ver.Trim().Split('.')
            $maj=[int]$parts[0]; $min=[int]$parts[1]
            if (($maj -gt 3) -or ($maj -eq 3 -and $min -ge 10)) { $needPython=$false; Log "Python compatible encontrado: $ver" }
        } catch {}
    }
    if ($needPython) {
        Log "Python compatible no encontrado. Descargando Python 3.12..."
        $pyInstaller = Join-Path $env:TEMP "dal-python-3.12.10-amd64.exe"
        Invoke-WebRequest "https://www.python.org/ftp/python/3.12.10/python-3.12.10-amd64.exe" -OutFile $pyInstaller
        Start-Process -FilePath $pyInstaller -ArgumentList "/quiet InstallAllUsers=0 PrependPath=1 Include_pip=1" -Wait
        $python = Join-Path $env:LOCALAPPDATA "Programs\Python\Python312\python.exe"
        if (-not (Test-Path $python)) { $python = Find-CommandPath "python.exe" }
    }
    if (-not $python -or -not (Test-Path $python)) { Fail "No se pudo encontrar Python despues de la instalacion." }

    # Python environment is always at project root, never inside Instalacion.
    $Venv = Join-Path $InstallDir ".venv"
    $Vpy = Join-Path $Venv "Scripts\python.exe"
    if (-not (Test-Path $Vpy)) {
        Log "Creando entorno Python en $Venv"
        & $python -m venv $Venv
        if ($LASTEXITCODE -ne 0) { Fail "No se pudo crear .venv." }
    } else { Log "Entorno Python existente: $Venv" }

    Log "Instalando dependencias Python..."
    & $Vpy -m pip install --disable-pip-version-check --upgrade pip
    if ($LASTEXITCODE -ne 0) { Fail "No se pudo actualizar pip." }
    & $Vpy -m pip install --disable-pip-version-check -r (Join-Path $InstallDir "requirements.txt")
    if ($LASTEXITCODE -ne 0) { Fail "No se pudieron instalar las dependencias." }

    # Environment file at project root.
    $envFile = Join-Path $InstallDir ".env"
    if (-not (Test-Path $envFile)) {
        @("OLLAMA_URL=http://127.0.0.1:11434","OLLAMA_MODEL=llama3.2:1b") | Set-Content -LiteralPath $envFile -Encoding UTF8
        Log "Creado .env local."
    }

    # Ollama official installation.
    Log "Comprobando Ollama..."
    $ollama = Find-CommandPath "ollama.exe"
    $ollamaCandidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"),
        (Join-Path $env:ProgramFiles "Ollama\ollama.exe")
    )
    if (-not $ollama) { foreach ($p in $ollamaCandidates) { if (Test-Path $p) { $ollama=$p; break } } }
    if (-not $ollama) {
        Log "Ollama no esta instalado. Ejecutando instalador oficial de Ollama..."
        try { & powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "irm https://ollama.com/install.ps1 | iex" } catch { Fail "No se pudo instalar Ollama: $($_.Exception.Message)" }
        Start-Sleep -Seconds 2
        $ollama = Find-CommandPath "ollama.exe"
        if (-not $ollama) { foreach ($p in $ollamaCandidates) { if (Test-Path $p) { $ollama=$p; break } } }
    }
    if (-not $ollama) { Fail "Ollama no quedo disponible." }
    Log "Ollama: $ollama"

    # Start Ollama only if API is not already responding.
    $ollamaReady=$false
    try { Invoke-WebRequest "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 3 | Out-Null; $ollamaReady=$true } catch {}
    if (-not $ollamaReady) {
        Log "Iniciando servicio local de Ollama..."
        Start-Process -FilePath $ollama -ArgumentList "serve" -WindowStyle Hidden
        for ($i=0; $i -lt 20; $i++) {
            Start-Sleep -Seconds 1
            try { Invoke-WebRequest "http://127.0.0.1:11434/api/tags" -UseBasicParsing -TimeoutSec 2 | Out-Null; $ollamaReady=$true; break } catch {}
        }
    }
    if (-not $ollamaReady) { Fail "Ollama se instalo, pero su API local no respondio en 127.0.0.1:11434." }

    Log "Comprobando modelo llama3.2:1b..."
    $tags = (& $ollama list 2>$null | Out-String)
    if ($tags -notmatch "llama3\.2:1b") {
        Log "Descargando llama3.2:1b..."
        & $ollama pull llama3.2:1b
        if ($LASTEXITCODE -ne 0) { Fail "No se pudo descargar llama3.2:1b." }
    } else { Log "Modelo llama3.2:1b ya disponible." }

    # Piper local runtime.
    $piperDir = Join-Path $InstallDir "runtime\piper"
    $piperExe = Join-Path $piperDir "piper.exe"
    New-Item -ItemType Directory -Force -Path $piperDir | Out-Null
    if (-not (Test-Path $piperExe)) {
        Log "Descargando Piper Windows x64..."
        $zip = Join-Path $env:TEMP "dal-piper-windows-amd64.zip"
        Invoke-WebRequest "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip" -OutFile $zip
        Get-ChildItem $piperDir -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
        Expand-Archive -Path $zip -DestinationPath $piperDir -Force
        $found = Get-ChildItem $piperDir -Filter "piper.exe" -Recurse | Select-Object -First 1
        if (-not $found) { Fail "No se encontro piper.exe en el paquete descargado." }
        if ($found.FullName -ne $piperExe) {
            Copy-Item (Join-Path $found.Directory.FullName "*") $piperDir -Recurse -Force
        }
    }
    if (-not (Test-Path $piperExe)) { Fail "Piper no quedo instalado en runtime\piper\piper.exe." }

    # Spanish Piper voice.
    $voiceDir = Join-Path $InstallDir "models\voices"
    $voice = Join-Path $voiceDir "es_MX-ald-medium.onnx"
    $voiceJson = Join-Path $voiceDir "es_MX-ald-medium.onnx.json"
    New-Item -ItemType Directory -Force -Path $voiceDir | Out-Null
    if (-not (Test-Path $voice)) {
        Log "Descargando voz española de Piper..."
        Invoke-WebRequest "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx" -OutFile $voice
    }
    if (-not (Test-Path $voiceJson)) {
        Invoke-WebRequest "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx.json" -OutFile $voiceJson
    }
    if (-not (Test-Path $voice) -or -not (Test-Path $voiceJson)) { Fail "No se pudo instalar la voz española de Piper." }

    # Final validation.
    Log "Validando estructura local..."
    $required = @(
        "backend\main.py","backend\ai.py","backend\db.py",
        "frontend\index.html","frontend\app.js","frontend\styles.css",
        "data\characters\characters.json","models\Videos\Opening.mp4",
        "runtime\piper\piper.exe","models\voices\es_MX-ald-medium.onnx",
        ".venv\Scripts\python.exe"
    )
    foreach ($rel in $required) { if (-not (Test-Path (Join-Path $InstallDir $rel))) { Fail "Falta el archivo requerido: $rel" } }
    Log "=== Instalacion completada correctamente ==="
    exit 0
}
catch {
    Fail $_.Exception.Message
}
