import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    """Tests GET / root welcome endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert data["status"] == "online"

def test_health_endpoint():
    """Tests GET /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["scaler_loaded"] is True

def test_predict_endpoint():
    """Tests POST /predict endpoint with a valid patient profile."""
    payload = {
        "age_years": 52,
        "gender": 1,
        "height": 170.0,
        "weight": 78.0,
        "ap_hi": 130,
        "ap_lo": 85,
        "cholesterol": 2,
        "gluc": 1,
        "smoke": 0,
        "alco": 0,
        "active": 1
    }
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert data["prediction"] in [0, 1]
    assert "risk_probability" in data
    assert "risk_percentage" in data
    assert "risk_tier" in data
    assert "bmi" in data
    assert "bp_category" in data
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0

def test_batch_predict_endpoint():
    """Tests POST /batch-predict endpoint with multiple patients."""
    payload = {
        "patients": [
            {
                "age_years": 28,
                "gender": 0,
                "height": 165.0,
                "weight": 58.0,
                "ap_hi": 115,
                "ap_lo": 75,
                "cholesterol": 1,
                "gluc": 1,
                "smoke": 0,
                "alco": 0,
                "active": 1
            },
            {
                "age_years": 62,
                "gender": 1,
                "height": 175.0,
                "weight": 95.0,
                "ap_hi": 160,
                "ap_lo": 100,
                "cholesterol": 3,
                "gluc": 2,
                "smoke": 1,
                "alco": 1,
                "active": 0
            }
        ]
    }
    response = client.post("/batch-predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_patients"] == 2
    assert len(data["predictions"]) == 2

def test_model_info_endpoint():
    """Tests GET /model-info endpoint."""
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["n_features"] == 12
    assert "GradientBoostingClassifier" in data["model_type"]

def test_dataset_stats_endpoint():
    """Tests GET /dataset-stats endpoint."""
    response = client.get("/dataset-stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 0
    assert "cardio_positive_percentage" in data
