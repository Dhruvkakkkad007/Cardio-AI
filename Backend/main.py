import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from config import API_TITLE, API_DESCRIPTION, API_VERSION, DEFAULT_HOST, DEFAULT_PORT
from schemas import (
    PatientDataInput,
    PredictionResponse,
    BatchPredictionInput,
    BatchPredictionResponse,
    HealthCheckResponse,
    ModelInfoResponse,
    DatasetStatsResponse
)
from model_loader import model_service, EXPECTED_FEATURES

app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (e.g. Vite frontend running on port 5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def root():
    """
    Root Endpoint - API Welcome & Documentation Pointer.
    """
    return {
        "message": "Welcome to CardioAI Cardiovascular Disease Risk Prediction API",
        "status": "online",
        "version": API_VERSION,
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }


@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
def health_check():
    """
    Health Check Endpoint - Verifies ML model and scaler status.
    """
    model_type = type(model_service.model).__name__ if model_service.model else "Not Loaded"
    return HealthCheckResponse(
        status="healthy" if model_service.is_loaded else "unhealthy",
        model_loaded=model_service.is_loaded,
        scaler_loaded=model_service.scaler is not None,
        model_type=model_type,
        expected_features=EXPECTED_FEATURES
    )


@app.post("/predict", response_model=PredictionResponse, status_code=status.HTTP_200_OK, tags=["Inference"])
def predict_cardio_risk(patient: PatientDataInput):
    """
    Single Patient CVD Risk Stratification Endpoint.
    Accepts patient demographics, biometrics, and lab markers to compute risk prediction.
    """
    try:
        response = model_service.predict(patient)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )


@app.post("/batch-predict", response_model=BatchPredictionResponse, tags=["Inference"])
def batch_predict(batch: BatchPredictionInput):
    """
    Batch Patient CVD Risk Stratification Endpoint.
    Accepts a list of patient profiles and returns predictions for all patients.
    """
    try:
        results = [model_service.predict(p) for p in batch.patients]
        return BatchPredictionResponse(
            total_patients=len(results),
            predictions=results
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction error: {str(e)}"
        )


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model Info"])
def get_model_info():
    """
    Model Information Endpoint - Details model architecture and scaler configuration.
    """
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML Model service is not initialized."
        )

    model_type = type(model_service.model).__name__
    scaler_type = type(model_service.scaler).__name__

    return ModelInfoResponse(
        model_type=model_type,
        n_features=len(EXPECTED_FEATURES),
        feature_names=EXPECTED_FEATURES,
        scaler_type=scaler_type,
        description="Gradient Boosting Classifier trained on 68,000+ cardiovascular patient records."
    )

    
@app.get("/dataset-stats", response_model=DatasetStatsResponse, tags=["EDA & Analytics"])
def get_dataset_stats():
    """
    Dataset Statistics Endpoint - Computes summary statistics from cardio_cleaned.csv.
    """
    try:
        stats = model_service.get_dataset_stats()
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error reading dataset stats: {str(e)}"
        )


if __name__ == "__main__":
    print(f"Starting CardioAI FastAPI Server on http://{DEFAULT_HOST}:{DEFAULT_PORT} ...")
    uvicorn.run("main:app", host=DEFAULT_HOST, port=DEFAULT_PORT, reload=True)
