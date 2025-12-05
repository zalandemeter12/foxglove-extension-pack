@echo off
setlocal enabledelayedexpansion

REM Read targets from scripts\targets.deps if present, otherwise fallback
set "script_dir=%~dp0"
set "target_file=%script_dir%targets.list"

REM Save the current directory
set "orig_dir=%cd%"

if exist "%target_file%" (
    for /f "usebackq delims=" %%t in ("%target_file%") do (
        REM skip empty lines and lines starting with #
        for /f "delims=" %%L in ("%%t") do set "line=%%L"
        call :trim line
        if not "!line!"=="" (
            if not "!line:~0,1!"=="#" (
                echo Installing dependencies for !line!...
                cd src\!line!
                npm install
                cd %orig_dir%
            )
        )
    )
) else (
    for %%t in (common circular-gauge value-display gg-display) do (
        echo Installing dependencies for %%t...
        cd src\%%t
        npm install
        cd %orig_dir%
    )
)

goto :eof

:trim
setlocal enabledelayedexpansion
set "_var=!%1!"
for /f "tokens=*" %%A in ('echo !_var!') do endlocal & set "%1=%%A"
goto :eof
