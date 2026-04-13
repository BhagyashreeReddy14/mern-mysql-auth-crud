@echo off
echo ========================================
echo   MERN Auth App - Starting...
echo ========================================

:: ── Step 1: Setup backend .env ──────────────────────────────────────────────
if not exist backend\.env (
    copy backend\.env.example backend\.env >nul
    echo [OK] backend\.env created
) else (
    echo [OK] backend\.env already exists
)

:: ── Step 2: Setup frontend .env ─────────────────────────────────────────────
if not exist frontend\.env (
    copy frontend\.env.example frontend\.env >nul
    echo [OK] frontend\.env created
) else (
    echo [OK] frontend\.env already exists
)

:: ── Step 3: Setup Database ───────────────────────────────────────────────────
echo.
echo [DB] Setting up MySQL database...

:: Read DB credentials from backend\.env
for /f "tokens=1,2 delims==" %%a in (backend\.env) do (
    if "%%a"=="DB_USER" set DB_USER=%%b
    if "%%a"=="DB_PASSWORD" set DB_PASSWORD=%%b
)

:: Try to find mysql in PATH or common install locations
set MYSQL_CMD=mysql
where mysql >nul 2>&1
if errorlevel 1 (
    if exist "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" (
        set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) else if exist "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" (
        set MYSQL_CMD="C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
    ) else if exist "C:\xampp\mysql\bin\mysql.exe" (
        set MYSQL_CMD="C:\xampp\mysql\bin\mysql.exe"
    ) else (
        echo [WARN] mysql not found. Skipping DB setup. Run database.sql manually.
        goto INSTALL
    )
)

%MYSQL_CMD% -u %DB_USER% -p%DB_PASSWORD% < database.sql >nul 2>&1
if errorlevel 1 (
    echo [WARN] DB setup failed. Check MySQL is running and credentials in backend\.env
) else (
    echo [OK] Database ready
)

:: ── Step 4: Install dependencies ────────────────────────────────────────────
:INSTALL
echo.
echo [NPM] Installing backend dependencies...
cd backend
call npm install --silent
cd ..

echo [NPM] Installing frontend dependencies...
cd frontend
call npm install --silent
cd ..

:: ── Step 5: Start servers ────────────────────────────────────────────────────
echo.
echo [START] Launching Backend on http://localhost:5000
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 >nul

echo [START] Launching Frontend on http://localhost:5173
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting...
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:5000
echo ========================================
pause
