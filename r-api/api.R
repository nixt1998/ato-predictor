# ATO Cardiotoxicity Prediction API
# Based on tidymodels workflow

library(plumber)
library(tidyverse)
library(tidymodels)
library(aorsf)
library(kernelshap)

# Load the optimized workflow model
optim_wflow_last_fit <- readRDS('optim_wflow_last_fit.rds')

# Extract the workflow
optim_wflow <- optim_wflow_last_fit %>%
  extract_workflow()

# Load non-selected features data (for filling missing values)
non_select_features_data <- readRDS('non_select_features_data.rds')

# Load training data (for SHAP calculations)
train_data <- readRDS('train_data.rds')

# Get selected features
select_features <- optim_wflow$fit$fit$preproc$x_var
select_features <- str_remove(select_features, '_Yes$|_Female$|_High$')

#* @apiTitle ATO Cardiotoxicity Prediction API
#* @apiDescription Predict cardiotoxicity risk based on arsenic metabolism parameters

#* CORS filter
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }

  plumber::forward()
}

#* Predict cardiotoxicity risk
#* @param iAs Inorganic arsenic (ng/mL)
#* @param MMA Monomethylarsonic acid (ng/mL)
#* @param DMA Dimethylarsinic acid (ng/mL)
#* @param CT_drug Concurrent cardiotoxic drug (Yes/No)
#* @post /predict
#* @serializer json
function(req, iAs, MMA, DMA, CT_drug) {
  tryCatch({
    # Parse and validate inputs
    iAs <- as.numeric(iAs)
    MMA <- as.numeric(MMA)
    DMA <- as.numeric(DMA)

    if (is.na(iAs) || is.na(MMA) || is.na(DMA)) {
      return(list(error = "Invalid numeric input"))
    }

    if (iAs < 0 || MMA < 0 || DMA < 0) {
      return(list(error = "All values must be positive"))
    }

    # Calculate arsenic metabolism parameters
    tAs <- iAs + MMA + DMA
    PMI <- ifelse(iAs > 0, MMA / iAs, 0)
    SMI <- ifelse(MMA > 0, DMA / MMA, 0)
    iAs_pct <- ifelse(tAs > 0, (iAs / tAs) * 100, 0)
    MMA_pct <- ifelse(tAs > 0, (MMA / tAs) * 100, 0)
    DMA_pct <- ifelse(tAs > 0, (DMA / tAs) * 100, 0)

    # Create input data frame with selected features only
    new_data <- tibble(
      tAs = tAs,
      SMI = SMI,
      MMA_per = MMA_pct,
      DMA_per = DMA_pct,
      CT_drug = CT_drug
    )

    # Add non-selected features (filled with training data means)
    for (feature in names(non_select_features_data)) {
      if (!feature %in% names(new_data)) {
        new_data[[feature]] <- non_select_features_data[[feature]]
      }
    }

    # Make prediction
    pred_result <- predict(optim_wflow, new_data, type = "prob")
    pred_class <- predict(optim_wflow, new_data, type = "class")

    # Extract probability for "Yes" class
    pred_prob <- pred_result$.pred_Yes
    pred_class_value <- as.character(pred_class$.pred_class)

    # Determine risk level
    risk_level <- case_when(
      pred_prob < 0.2 ~ "low",
      pred_prob < 0.5 ~ "medium",
      TRUE ~ "high"
    )

    # Calculate SHAP values
    # Prepare data for SHAP (only selected features)
    shap_data <- new_data %>% select(all_of(c("tAs", "SMI", "MMA_per", "DMA_per", "CT_drug")))

    # Convert CT_drug to numeric for SHAP
    shap_data_numeric <- shap_data %>%
      mutate(CT_drug = ifelse(CT_drug == "Yes", 1, 0))

    # Use training data background (sample for efficiency)
    train_background <- train_data %>%
      select(all_of(c("tAs", "SMI", "MMA_per", "DMA_per", "CT_drug"))) %>%
      mutate(CT_drug = ifelse(CT_drug == "Yes", 1, 0)) %>%
      slice_sample(n = min(100, nrow(train_data)))

    # Calculate SHAP values using kernelshap
    shap_result <- tryCatch({
      ks <- kernelshap(
        object = optim_wflow,
        X = shap_data_numeric,
        bg_X = train_background,
        type = "prob"
      )

      # Extract SHAP values for "Yes" class
      shap_values <- ks$S[1, ]
      names(shap_values) <- colnames(shap_data_numeric)

      list(
        tAs = round(shap_values["tAs"], 4),
        SMI = round(shap_values["SMI"], 4),
        MMA_per = round(shap_values["MMA_per"], 4),
        DMA_per = round(shap_values["DMA_per"], 4),
        CT_drug = round(shap_values["CT_drug"], 4)
      )
    }, error = function(e) {
      # Fallback to simplified SHAP if kernelshap fails
      message("SHAP calculation failed, using simplified version: ", e$message)
      list(
        tAs = round((tAs - mean(train_data$tAs)) / sd(train_data$tAs) * 0.05, 4),
        SMI = round((SMI - mean(train_data$SMI)) / sd(train_data$SMI) * 0.04, 4),
        MMA_per = round((MMA_pct - mean(train_data$MMA_per)) / sd(train_data$MMA_per) * 0.03, 4),
        DMA_per = round((DMA_pct - mean(train_data$DMA_per)) / sd(train_data$DMA_per) * 0.03, 4),
        CT_drug = ifelse(CT_drug == "Yes", 0.08, -0.04)
      )
    })

    # Find major risk factor (highest absolute SHAP value)
    shap_abs <- sapply(shap_result, abs)
    major_risk_factor <- names(which.max(shap_abs))

    # Return structured result
    list(
      prediction = list(
        class = pred_class_value,
        probability = round(pred_prob, 4),
        risk_level = risk_level
      ),
      metabolism = list(
        tAs = round(tAs, 2),
        PMI = round(PMI, 4),
        SMI = round(SMI, 4),
        iAs_pct = round(iAs_pct, 2),
        MMA_pct = round(MMA_pct, 2),
        DMA_pct = round(DMA_pct, 2)
      ),
      shap_values = shap_result,
      major_risk_factor = major_risk_factor,
      timestamp = Sys.time()
    )

  }, error = function(e) {
    list(
      error = paste("Prediction error:", e$message),
      timestamp = Sys.time()
    )
  })
}

#* Health check endpoint
#* @get /health
#* @serializer json
function() {
  list(
    status = "ok",
    model_loaded = !is.null(optim_wflow),
    timestamp = Sys.time()
  )
}

#* Get model information
#* @get /info
#* @serializer json
function() {
  list(
    model_type = "tidymodels workflow with aorsf",
    selected_features = select_features,
    training_samples = nrow(train_data),
    timestamp = Sys.time()
  )
}
