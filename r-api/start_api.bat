@echo off
echo ============================================
echo  ATO Cardiotoxicity Prediction - R API
echo ============================================
echo.

cd /d "%~dp0"

echo Checking R installation...
where Rscript >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: R is not installed or not in PATH
    echo Please install R from https://cran.r-project.org/
    pause
    exit /b 1
)

echo Checking required files...
if not exist "optim_wflow_last_fit.rds" (
    echo ERROR: optim_wflow_last_fit.rds not found
    pause
    exit /b 1
)
if not exist "non_select_features_data.rds" (
    echo ERROR: non_select_features_data.rds not found
    pause
    exit /b 1
)
if not exist "train_data.rds" (
    echo ERROR: train_data.rds not found
    pause
    exit /b 1
)

echo All files OK.
echo.
echo Installing required R packages (first run may take a while)...
Rscript -e "pkgs <- c('plumber','tidyverse','tidymodels','aorsf','kernelshap','colino','bonsai','censored'); new <- pkgs[!pkgs %%in%% installed.packages()[,'Package']]; if(length(new)) install.packages(new, repos='https://cran.r-project.org/')"

echo.
echo Starting R API server on http://localhost:8000 ...
echo Press Ctrl+C to stop.
echo.

Rscript start.R

pause
