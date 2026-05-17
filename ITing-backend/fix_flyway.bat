@echo off
echo ============================================
echo   ITing Backend - Fix Flyway + Clean Build
echo ============================================
echo.

cd /d "c:\Users\Admin\Desktop\dacn\ITing\ITing-backend"

echo [1/3] Deleting duplicate V77 migration files...
del /f /q "src\main\resources\db\migration\V77__seed_terms_privacy_pages.sql" 2>nul
del /f /q "target\classes\db\migration\V77__seed_terms_privacy_pages.sql" 2>nul

echo [2/3] Cleaning build cache (mvn clean)...
call mvn clean -q

echo [3/3] Verifying...
echo.

if exist "src\main\resources\db\migration\V77__seed_terms_privacy_pages.sql" (
    echo [FAIL] V77 src file still exists!
) else (
    echo [OK] V77 duplicate removed from src
)

if exist "target\classes\db\migration\V77__seed_terms_privacy_pages.sql" (
    echo [FAIL] V77 target file still exists!
) else (
    echo [OK] V77 duplicate removed from target
)

if exist "src\main\resources\db\migration\V81__seed_terms_privacy_pages.sql" (
    echo [OK] V81 replacement exists
) else (
    echo [WARN] V81 replacement missing!
)

echo.
echo ============================================
echo   Done! Now restart backend in IntelliJ.
echo ============================================
pause
