@echo off
echo ========================================
echo  CHROMIUM FIX - GIT PUSH TO REDEPLOY
echo ========================================
echo.
echo This will push the fixes to GitHub,
echo which will automatically redeploy on Vercel.
echo.
pause

cd /d "%~dp0"

echo.
echo Step 1: Adding changes...
git add .

echo.
echo Step 2: Committing...
git commit -m "Fix Chromium launch issue - update to v123 and optimize for Vercel"

echo.
echo Step 3: Pushing to GitHub...
git push

echo.
echo ========================================
echo  PUSHED TO GITHUB!
echo ========================================
echo.
echo Vercel will automatically redeploy in 1-2 minutes.
echo.
echo Check deployment status at:
echo https://vercel.com/dashboard
echo.
echo After deployment completes, test your PDF!
echo.
pause

