@echo off
setlocal enabledelayedexpansion

set "script_dir=%~dp0"
set "target_file=%script_dir%targets.list"

REM Save the current directory
set "orig_dir=%cd%"

if exist "%target_file%" (
    for /f "usebackq tokens=* delims= " %%t in ("%target_file%") do (
        call :process_line "%%t"
    )
) else (
    for %%t in (circular-gauge value-display gg-display) do (
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
            REM Exclude the 'common' target (case-insensitive)
            if /I "!line!"=="common" (
                echo Skipping common target
            ) else (
                echo Building !line!...
                cd /d "%orig_dir%\src\!line!"
                npm run local-install
                npm run package
                cd /d "%orig_dir%"
            )
        )
    )
)
goto :eof