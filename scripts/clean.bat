@echo off
REM Change to repository root (scripts/ is one level down)
pushd "%~dp0\.."

echo Removing all node_modules directories (this may take a while)...

REM The "dir /s /b /ad node_modules" lists node_modules directories recursively.
for /f "delims=" %%D in ('dir /s /b /ad node_modules 2^>nul') do (
  echo Removing "%%D"
  rd /s /q "%%D"
)

REM Remove dist directories
for /f "delims=" %%D in ('dir /s /b /ad dist 2^>nul') do (
  echo Removing dist "%%D"
  rd /s /q "%%D"
)

REM Remove .foxe files
for /f "delims=" %%F in ('dir /s /b "*.foxe" 2^>nul') do (
  echo Deleting file "%%F"
  del /f /q "%%F"
)

echo Done.
popd

exit /b 0
