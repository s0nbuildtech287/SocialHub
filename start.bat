@echo off
title SocialHub - Goc Tang Ca Fanpage Manager
echo =======================================================
echo    DANG KHOI DONG SOCIALHUB (GOC TANG CA MANAGER)
echo =======================================================
echo.

start "SocialHub Backend" cmd /c "cd backend && npm start"
timeout /t 2 /nobreak >nul
start "SocialHub Frontend" cmd /c "cd frontend && npm run dev"

echo Da khoi dong Backend tai: http://localhost:5000
echo Da khoi dong Frontend tai: http://localhost:3000
echo.
echo Mo trinh duyet va vao http://localhost:3000 de su dung!
pause
