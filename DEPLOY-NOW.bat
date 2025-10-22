@echo off
echo ========================================
echo  PDF API - Quick Deploy to Vercel
echo ========================================
echo.
echo This will deploy your PDF API to Vercel.
echo You'll need to login with your Vercel account.
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Logging into Vercel...
echo (A browser window will open)
echo.
vercel login

echo.
echo Step 2: Deploying to production...
echo.
vercel --prod

echo.
echo ========================================
echo  DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Copy your deployment URL from above.
echo It will look like: https://bhc-pdf-api.vercel.app
echo.
echo Next: Update bhclive.html line 3495 with this URL
echo.
pause

