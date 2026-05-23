@echo off
cd /d "%~dp0"

if not exist "backend\.env" copy "backend\.env.example" "backend\.env"
if not exist "UPlant\src\config.local.ts" copy "UPlant\src\config.example.ts" "UPlant\src\config.local.ts"

echo Local config files are ready.
echo.
echo Edit backend\.env and add your PLANTNET_API_KEY.
echo Edit UPlant\src\config.local.ts and set your computer Wi-Fi IP.
