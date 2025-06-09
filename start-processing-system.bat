@echo off
echo ========================================
echo   SISTEMA DE PROCESAMIENTO MULTIMEDIA
echo ========================================
echo.
echo Iniciando servicios del sistema de procesamiento...
echo.

REM Verificar si Docker está ejecutándose
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está ejecutándose
    echo Por favor, instala Docker Desktop y asegúrate de que esté ejecutándose
    pause
    exit /b 1
)

REM Verificar si Docker Compose está disponible
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Compose no está disponible
    echo Por favor, asegúrate de que Docker Compose esté instalado
    pause
    exit /b 1
)

echo ✅ Docker está disponible
echo.

echo 🚀 Iniciando servicios del sistema de procesamiento...
echo.

REM Iniciar servicios de base de datos y Redis primero
echo 📊 Iniciando bases de datos y Redis...
docker-compose up -d postgres-processing postgres-cleanup redis-notifications

REM Esperar a que las bases de datos estén listas
echo ⏳ Esperando a que las bases de datos estén listas...
timeout /t 10 /nobreak >nul

REM Iniciar servicios de procesamiento
echo 🎨 Iniciando Processing Service (Puerto 5904)...
docker-compose up -d processing-service

echo 🧹 Iniciando Cleanup Service (Puerto 5905)...
docker-compose up -d cleanup-service

echo 🖥️  Iniciando Monitoring Dashboard (Puerto 5906)...
docker-compose up -d monitoring-dashboard

echo.
echo ⏳ Esperando a que todos los servicios estén listos...
timeout /t 15 /nobreak >nul

echo.
echo 🔍 Verificando estado de los servicios...
echo.

REM Verificar Processing Service
echo Verificando Processing Service (Puerto 5904)...
curl -s -o nul -w "%%{http_code}" http://localhost:5904/health >temp_status.txt
set /p status=<temp_status.txt
if "%status%"=="200" (
    echo ✅ Processing Service: FUNCIONANDO
) else (
    echo ❌ Processing Service: ERROR (Código: %status%)
)
del temp_status.txt

REM Verificar Cleanup Service
echo Verificando Cleanup Service (Puerto 5905)...
curl -s -o nul -w "%%{http_code}" http://localhost:5905/health >temp_status.txt
set /p status=<temp_status.txt
if "%status%"=="200" (
    echo ✅ Cleanup Service: FUNCIONANDO
) else (
    echo ❌ Cleanup Service: ERROR (Código: %status%)
)
del temp_status.txt

REM Verificar Monitoring Dashboard
echo Verificando Monitoring Dashboard (Puerto 5906)...
curl -s -o nul -w "%%{http_code}" http://localhost:5906/health >temp_status.txt
set /p status=<temp_status.txt
if "%status%"=="200" (
    echo ✅ Monitoring Dashboard: FUNCIONANDO
) else (
    echo ❌ Monitoring Dashboard: ERROR (Código: %status%)
)
del temp_status.txt

echo.
echo ========================================
echo   SISTEMA DE PROCESAMIENTO INICIADO
echo ========================================
echo.
echo 🎨 Processing Service:
echo    - URL: http://localhost:5904
echo    - Swagger: http://localhost:5904/api/docs
echo    - Health: http://localhost:5904/health
echo.
echo 🧹 Cleanup Service:
echo    - URL: http://localhost:5905
echo    - Swagger: http://localhost:5905/api/docs
echo    - Health: http://localhost:5905/health
echo.
echo 🖥️  Monitoring Dashboard:
echo    - Dashboard: http://localhost:5906/dashboard
echo    - API: http://localhost:5906/api/docs
echo    - Health: http://localhost:5906/health
echo.
echo 📊 Bases de Datos:
echo    - PostgreSQL Processing: localhost:5436
echo    - PostgreSQL Cleanup: localhost:5437
echo    - Redis Notifications: localhost:6380
echo.
echo ========================================
echo.
echo Para detener todos los servicios, ejecuta:
echo docker-compose down
echo.
echo Para ver logs en tiempo real:
echo docker-compose logs -f processing-service
echo docker-compose logs -f cleanup-service
echo docker-compose logs -f monitoring-dashboard
echo.
pause 