@echo off
REM =========================================================================
REM  Automated GitHub Push Script for ganeshmandal.in
REM  Account: softwareasg@gmail.com
REM =========================================================================

echo.
echo ===================================================
echo   GaneshMandal.in - Push to GitHub Repository
echo ===================================================
echo.

set REPO_URL=%1
if "%REPO_URL%"=="" (
    set REPO_URL=https://github.com/softwareasg-tools/ganeshmandal.git
)

echo.
echo [1/3] Setting remote origin to: %REPO_URL%
git remote set-url origin %REPO_URL% 2>nul || git remote add origin %REPO_URL%

echo.
echo [2/3] Staging all files and verifying commit...
git add -A
git commit -m "deploy: update live portal for ganeshmandal.in" --allow-empty

echo.
echo [3/3] Pushing to main branch...
git branch -M main
git push -u origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================
    echo   SUCCESS! Code pushed to %REPO_URL%
    echo   You can now connect this repo in Hostinger hPanel!
    echo ===================================================
) else (
    echo [ERROR] Git push failed. Please verify repository access permissions.
)

pause
