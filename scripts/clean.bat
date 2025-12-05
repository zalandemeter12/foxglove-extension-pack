@echo off
setlocal enabledelayedexpansion

REM Change to repository root
pushd "%~dp0\.."

echo Searching for and removing all node_modules and dist directories, and any *.foxe files (this may take a while)...

REM ---------- Remove node_modules ----------
dir /s /b /ad node_modules > _nm.txt 2>nul
if exist _nm.txt (
    sort /R _nm.txt > _nm_rev.txt
    for /f "usebackq delims=" %%D in ("_nm_rev.txt") do (
        echo Removing "%%D"
        rd /s /q "%%D" 2>nul
    )
    del _nm.txt _nm_rev.txt 2>nul
)

REM ---------- Remove dist directories ----------
dir /s /b /ad dist > _dist.txt 2>nul
if exist _dist.txt (
    sort /R _dist.txt > _dist_rev.txt
    for /f "usebackq delims=" %%D in ("_dist_rev.txt") do (
        echo Removing dist "%%D"
        rd /s /q "%%D" 2>nul
    )
    del _dist.txt _dist_rev.txt 2>nul
)

REM ---------- Remove .foxe files ----------
dir /s /b *.foxe > _foxe.txt 2>nul
if exist _foxe.txt (
    for /f "usebackq delims=" %%F in ("_foxe.txt") do (
        echo Deleting file "%%F"
        del /f /q "%%F" 2>nul
    )
    del _foxe.txt 2>nul
)

echo Cleanup complete: removed node_modules, dist directories and .foxe files.

popd
exit /b 0
