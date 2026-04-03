@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "BACKEND_PYTHON=%BACKEND_DIR%\venv\Scripts\python.exe"
set "BACKEND_ENV=%BACKEND_DIR%\.env"
set "BACKEND_ENV_LOCAL=%BACKEND_DIR%\.env.local"
set "FRONTEND_NODE_MODULES=%FRONTEND_DIR%\node_modules"

if not exist "%BACKEND_PYTHON%" (
  echo [ERRO] Ambiente virtual do backend nao encontrado.
  echo Rode estes comandos primeiro:
  echo   cd /d "%BACKEND_DIR%"
  echo   python -m venv venv
  echo   venv\Scripts\pip install -r requirements.txt
  pause
  exit /b 1
)

if not exist "%BACKEND_ENV%" if not exist "%BACKEND_ENV_LOCAL%" (
  echo [ERRO] Arquivo de configuracao do backend nao encontrado.
  echo Crie "%BACKEND_ENV%" ou "%BACKEND_ENV_LOCAL%" com a GEMINI_API_KEY.
  pause
  exit /b 1
)

if not exist "%FRONTEND_NODE_MODULES%" (
  echo [ERRO] Dependencias do frontend nao encontradas.
  echo Rode estes comandos primeiro:
  echo   cd /d "%FRONTEND_DIR%"
  echo   npm install
  pause
  exit /b 1
)

echo Iniciando backend em nova janela...
start "Video Summarizer Backend" cmd /k "cd /d ""%BACKEND_DIR%"" ^&^& .\venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000"

echo Iniciando frontend em nova janela...
start "Video Summarizer Frontend" cmd /k "cd /d ""%FRONTEND_DIR%"" ^&^& npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Aguarde alguns segundos e abra o frontend no navegador.
pause
