@echo off
setlocal enabledelayedexpansion

set "script_dir=%~dp0"
set "target_file=%script_dir%targets.list"

REM Save the current directory
set "orig_dir=%cd%"

if exist "%target_file%" (
    for /f "usebackq delims=" %%t in ("%target_file%") do (
        for /f "delims=" %%L in ("%%t") do set "line=%%L"
        call :trim line
        if not "!line!"=="" (
            if not "!line:~0,1!"=="#" (
                REM Exclude the 'common' target (case-insensitive)
                if /I "!line!"=="common" (
                    echo Skipping common target
                ) else (
                    echo Building !line!...
                    cd src\!line!
                    npm run local-install
                    npm run package
                    cd %orig_dir%
                )
            )
        )
    )
) else (
    for %%t in (circular-gauge value-display gg-display) do (
        echo Building %%t...
        cd src\%%t
        npm run local-install
        npm run package
        cd %orig_dir%
    )
)

goto :eof

:trim
setlocal enabledelayedexpansion
set "_var=!%1!"
for /f "tokens=*" %%A in ('echo !_var!') do endlocal & set "%1=%%A"
goto :eof