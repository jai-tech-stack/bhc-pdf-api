@echo off
echo ========================================
echo  FIXING CHROMIUM LAUNCH ISSUE
echo ========================================
echo.
echo I've updated:
echo - Chromium version (119 to 123)
echo - Puppeteer version (19 to 21)
echo - Memory allocation (1024MB to 3008MB)
echo - Added serverless optimization flags
echo.
echo Now redeploying with fixes...
echo.
pause

cd /d "%~dp0"

echo Step 1: Installing updated dependencies...
call npm install

echo.
echo Step 2: Redeploying to Vercel...
call vercel --prod

echo.
echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo The Chromium launch issue should now be fixed!
echo.
echo Test your PDF generation again:
echo 1. Go to brandhealthchecker.com
echo 2. Complete an assessment
echo 3. Download PDF
echo.
pause

