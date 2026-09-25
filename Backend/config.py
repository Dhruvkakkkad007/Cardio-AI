import os
from pathlib import Path

# Base directory for Backend module
BASE_DIR = Path(__file__).resolve().parent

# Root project directory
PROJECT_ROOT = BASE_DIR.parent

# Paths to ML Artifacts & Data
MODEL_PATH = PROJECT_ROOT / "models" / "gb_model.pkl"
SCALER_PATH = PROJECT_ROOT / "models" / "scaler.pkl"
DATASET_PATH = PROJECT_ROOT / "data" / "cardio_cleaned.csv"

# API Metadata
API_TITLE = "CardioAI - Cardiovascular Risk Prediction API"
API_DESCRIPTION = (
    "FastAPI production backend for Cardiovascular Disease (CVD) Risk Stratification. "
    "Integrates Gradient Boosting Classifier trained on 68,000+ patient records."
)
API_VERSION = "1.0.0"

# Server Settings
DEFAULT_HOST = os.environ.get("HOST", "0.0.0.0")
DEFAULT_PORT = int(os.environ.get("PORT", 8000))
