# ATO Cardiotoxicity Prediction API
# Based on original Shiny server logic
# Requires: R-4.5.0/bin/x64/Rscript.exe

library(plumber)
library(colino)          # step_select_forests — must load before tidymodels
library(tidyverse)
library(tidymodels)
library(aorsf)
library(bonsai)
library(kernelshap)

cat("[ATO API] Loading models...\n")

# Load models (same as Shiny app)
optim_wflow_last_fit <- readRDS("optim_wflow_last_fit.rds")
optim_wflow          <- extract_workflow(optim_wflow_last_fit)
non_select_features_data <- readRDS("non_select_features_data.rds")
train_data           <- readRDS("train_data.rds")

# Selected features (same logic as Shiny)
select_features <- optim_wflow$fit$fit$preproc$x_var
select_features <- str_remove(select_features, "_Yes$|_Female$|_High$")

cat("[ATO API] Models loaded. Select features:", paste(select_features, collapse = ", "), "\n")

# ── CORS ──────────────────────────────────────────────────────────────────────
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin",  "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req$REQUEST_METHOD == "OPTIONS") { res$status <- 200; return(list()) }
  plumber::forward()
}

# ── /predict ──────────────────────────────────────────────────────────────────
#* @post /predict
#* @serializer json
function(req) {
  tryCatch({
    body <- jsonlite::fromJSON(req$postBody)

    iAs    <- as.numeric(body$iAs)
    MMA    <- as.numeric(body$MMA)
    DMA    <- as.numeric(body$DMA)
    CT_drug <- as.character(body$CT_drug)

    if (any(is.na(c(iAs, MMA, DMA)))) stop("Invalid numeric input")
    if (any(c(iAs, MMA, DMA) < 0))   stop("Values must be >= 0")

    # ── Metabolism parameters (same as Shiny server) ──────────────────────────
    tAs     <- iAs + MMA + DMA
    PMI     <- if (iAs > 0) MMA / iAs else 0
    SMI     <- if (MMA > 0) DMA / MMA else 0
    iAs_pct <- if (tAs > 0) (iAs / tAs) * 100 else 0
    MMA_pct <- if (tAs > 0) (MMA / tAs) * 100 else 0
    DMA_pct <- if (tAs > 0) (DMA / tAs) * 100 else 0

    # ── Prediction data (same as Shiny bind_cols) ─────────────────────────────
    pred_data <- tibble(
      tAs     = tAs,
      SMI     = SMI,
      MMA_per = MMA_pct,
      DMA_per = DMA_pct,
      CT_drug = CT_drug
    ) |>
      mutate(CT_drug = factor(CT_drug, levels = c("No", "Yes"))) |>
      bind_cols(non_select_features_data)

    # ── Model prediction ──────────────────────────────────────────────────────
    pred_class <- predict(optim_wflow, new_data = pred_data, type = "class") |>
      pull(.pred_class) |> as.character()

    pred_prob <- optim_wflow_last_fit |>
      extract_workflow() |>
      predict(new_data = pred_data, type = "prob") |>
      pull(.pred_Yes)

    risk_level <- case_when(
      pred_prob < 0.2 ~ "low",
      pred_prob < 0.5 ~ "medium",
      TRUE            ~ "high"
    )

    # ── SHAP values ───────────────────────────────────────────────────────────
    shap_res  <- kernelshap(
      object = optim_wflow,
      X      = pred_data,
      bg_X   = train_data |> select(-outcome),
      type   = "prob"
    )
    shap_data <- shap_res$S$.pred_Yes |>
      as_tibble() |>
      select(all_of(select_features))

    shap_list <- as.list(shap_data[1, ])
    shap_list <- lapply(shap_list, function(x) round(as.numeric(x), 4))

    # Major risk factor (highest |SHAP|)
    major_risk_factor <- names(which.max(abs(unlist(shap_list))))

    # ── Return ────────────────────────────────────────────────────────────────
    list(
      prediction = list(
        class      = pred_class,
        probability = round(pred_prob, 4),
        risk_level = risk_level
      ),
      metabolism = list(
        tAs     = round(tAs,     2),
        PMI     = round(PMI,     4),
        SMI     = round(SMI,     4),
        iAs_pct = round(iAs_pct, 2),
        MMA_pct = round(MMA_pct, 2),
        DMA_pct = round(DMA_pct, 2)
      ),
      shap_values       = shap_list,
      major_risk_factor = major_risk_factor,
      timestamp         = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ")
    )

  }, error = function(e) {
    list(error = paste("Prediction error:", conditionMessage(e)))
  })
}

# ── /health ───────────────────────────────────────────────────────────────────
#* @get /health
#* @serializer json
function() {
  list(status = "ok", model_loaded = TRUE,
       select_features = select_features,
       timestamp = format(Sys.time(), "%Y-%m-%dT%H:%M:%SZ"))
}
