@echo off
setlocal enabledelayedexpansion

set "script_dir=%~dp0"
set "target_file=%script_dir%targets.list"

REM Save the current directory
set "orig_dir=%cd%"

if exist "%target_file%" (
    for /f "usebackq tokens=* delims= " %%t in ("%target_file%") do (
        set "target=%%t"
        REM skip empty lines and lines starting with #
        if defined target (
            set "firstchar=!target:~0,1!"
            if not "!firstchar!"=="#" (
                if not "!target!"=="" (
                    REM Exclude the 'common' target (case-insensitive)
                    if /I not "!target!"=="common" (
                        echo Building !target!...
                        if exist "%orig_dir%\src\!target!" (
                            pushd "%orig_dir%\src\!target!"
                            call npm run local-install
                            if !errorlevel! equ 0 (
                                call npm run package
                            )
                            popd
                        ) else (
                            echo Warning: Directory "%orig_dir%\src\!target!" does not exist
                        )
                    ) else (
                        echo Skipping common target
                    )
                )
            )
        )
    )
) else (
    for %%t in (circular-gauge value-display gg-display) do (
        set "target=%%t"
        REM Exclude the 'common' target (case-insensitive)
        if /I not "!target!"=="common" (
            echo Building !target!...
            if exist "%orig_dir%\src\!target!" (
                pushd "%orig_dir%\src\!target!"
                call npm run local-install
                if !errorlevel! equ 0 (
                    call npm run package
                )
                popd
            ) else (
                echo Warning: Directory "%orig_dir%\src\!target!" does not exist
            )
        ) else (
            echo Skipping common target
        )
    )
)

endlocal