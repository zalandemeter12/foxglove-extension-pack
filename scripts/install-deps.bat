@echo off
setlocal enabledelayedexpansion

REM Read targets from scripts\targets.list if present, otherwise fallback
set "script_dir=%~dp0"
set "target_file=%script_dir%targets.list"

REM Save the current directory
set "orig_dir=%cd%"

if exist "%target_file%" (
    for /f "usebackq tokens=* delims= " %%t in ("%target_file%") do (
        call :process_line "%%t"
    )
) else (
    for %%t in (common circular-gauge value-display gg-display) do (
        call :process_line "%%t"
    )
)

goto :eof

:process_line
set "line=%~1"
REM skip empty lines and lines starting with #
if defined line (
    set "firstchar=!line:~0,1!"
    if not "!firstchar!"=="#" (
        if not "!line!"=="" (
            echo Installing dependencies for !line!...
            cd /d "%orig_dir%\src\!line!"
            if exist "package.json" (
                npm install
            ) else (
                echo Warning: package.json not found in src\!line!
            )
            cd /d "%orig_dir%"
        )
    )
)
goto :eof
