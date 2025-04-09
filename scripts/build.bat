@echo off
setlocal enabledelayedexpansion

REM Define targets array
set targets=circular-gauge value-display gg-diagram
@REM set targets=circular-gauge

REM Save the current directory
set orig_dir=%cd%

REM Loop through each target
for %%t in (%targets%) do (
    echo Building %%t...
    cd src\%%t
    npm run local-install
    cd %orig_dir%
)