@echo off
echo ==========================================
echo   Iniciando Backend - Calculadora APU
echo ==========================================
echo.

:: Change to the script's directory
cd /d "%~dp0"

:: Set PYTHONPATH to include the backend directory so 'src' module is found
set PYTHONPATH=%PYTHONPATH%;%CD%\backend

:: Activate Virtual Environment
if exist "backend\venv\Scripts\activate.bat" (
    call backend\venv\Scripts\activate.bat
) else (
    echo [ERROR] No se encontro el entorno virtual en backend\venv.
    echo Por favor ejecuta: pip install -r backend/requirements.txt
    pause
    exit /b
)

:: Run the Server
echo Iniciando servidor en http://localhost:8000 ...
python backend\src\main.py

pause
