@echo off
echo ============================================
echo  ATO Cardiotoxicity Prediction - R API
echo ============================================
echo.

cd /d "%~dp0"

set RSCRIPT="C:\Program Files\R\R-4.5.0\bin\x64\Rscript.exe"

echo Checking R 4.5.0 x64...
if not exist %RSCRIPT% (
    echo ERROR: Rscript not found at %RSCRIPT%
    pause
    exit /b 1
)

echo Checking required model files...
if not exist "optim_wflow_last_fit.rds"    ( echo ERROR: optim_wflow_last_fit.rds not found & pause & exit /b 1 )
if not exist "non_select_features_data.rds" ( echo ERROR: non_select_features_data.rds not found & pause & exit /b 1 )
if not exist "train_data.rds"              ( echo ERROR: train_data.rds not found & pause & exit /b 1 )

echo All model files found.
echo.
echo Starting R API on http://localhost:8000 ...
echo Press Ctrl+C to stop.
echo.

%RSCRIPT% start.R

pause
