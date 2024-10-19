@echo off
setlocal enabledelayedexpansion

REM Define targets array
set targets=circular-gauge value-display

REM Save the current directory
set orig_dir=%cd%

REM Loop through each target
for %%t in (%targets%) do (
    echo Installing dependencies for %%t...
    cd src\%%t
    npm install
    cd %orig_dir%
)