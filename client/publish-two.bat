@echo off
setlocal

set MESSAGE=%~1
if "%MESSAGE%"=="" set MESSAGE=Hello from Celery Task Two

set AMOUNT=%~2
if "%AMOUNT%"=="" set AMOUNT=250000

set SERVER_URL=%SERVER_URL%
if "%SERVER_URL%"=="" set SERVER_URL=http://localhost:3000/message/publish-two

echo Sending publish request to %SERVER_URL%
echo Message: "%MESSAGE%"
echo Amount:  %AMOUNT%
echo ----------------------------------------

curl -X POST "%SERVER_URL%" ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"%MESSAGE%\", \"amount\": %AMOUNT%}"

echo.
