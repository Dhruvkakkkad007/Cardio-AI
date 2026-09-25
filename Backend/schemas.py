from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class PatientDataInput(BaseModel):
    """
    Input schema representing patient demographics, biometrics, and clinical lab values.
    """
    age_years: float = Field(..., ge=10, le=120, description="Patient age in years")
    gender: int = Field(..., ge=0, le=1, description="Biological sex (0 = Female, 1 = Male)")
    height: float = Field(..., ge=100, le=250, description="Height in centimeters")
    weight: float = Field(..., ge=30, le=250, description="Weight in kilograms")
    ap_hi: int = Field(..., ge=60, le=240, description="Systolic blood pressure (mmHg)")
    ap_lo: int = Field(..., ge=30, le=180, description="Diastolic blood pressure (mmHg)")
    cholesterol: int = Field(..., ge=1, le=3, description="Serum cholesterol (1: Normal, 2: Above Normal, 3: High)")
    gluc: int = Field(..., ge=1, le=3, description="Fasting blood glucose (1: Normal, 2: Above Normal, 3: High)")
    smoke: int = Field(..., ge=0, le=1, description="Smoking habit (0: Non-smoker, 1: Smoker)")
    alco: int = Field(..., ge=0, le=1, description="Alcohol consumption (0: No, 1: Yes)")
    active: int = Field(..., ge=0, le=1, description="Physical activity status (0: Sedentary, 1: Active)")
    bmi: Optional[float] = Field(None, description="Body Mass Index (kg/m²). Calculated automatically if omitted.")

    model_config = {
        "json_schema_extra": {
            "example": {
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
        }
    }


class FeatureContribution(BaseModel):
    feature: str
    label: str
    value: float
    effect: float
    impact: str


class BPCategoryInfo(BaseModel):
    stage: str
    level: int
    description: str
    ap_hi: int
    ap_lo: int


class PredictionResponse(BaseModel):
    """
    Response schema returned after running ML model inference on patient input data.
    """
    prediction: int = Field(..., description="Binary target prediction (0: Low CVD Risk, 1: High CVD Risk)")
    prediction_label: str = Field(..., description="Human-readable prediction result ('Low Risk' or 'High Risk')")
    risk_probability: float = Field(..., description="Calculated probability of CVD (0.0 to 1.0)")
    risk_percentage: float = Field(..., description="Risk probability expressed as a percentage (0.0% to 100.0%)")
    risk_tier: str = Field(..., description="Risk classification ('Low Risk', 'Moderate Risk', 'High Risk')")
    bmi: float = Field(..., description="Calculated Body Mass Index (kg/m²)")
    bmi_category: str = Field(..., description="BMI Classification category (Underweight, Normal, Overweight, Obese)")
    bp_category: BPCategoryInfo = Field(..., description="AHA Blood Pressure Staging classification")
    recommendations: List[str] = Field(..., description="Personalized clinical recommendations")
    feature_contributions: List[FeatureContribution] = Field(..., description="Feature contribution scores")


class BatchPredictionInput(BaseModel):
    patients: List[PatientDataInput]


class BatchPredictionResponse(BaseModel):
    total_patients: int
    predictions: List[PredictionResponse]


class HealthCheckResponse(BaseModel):
    status: str
    model_loaded: bool
    scaler_loaded: bool
    model_type: str
    expected_features: List[str]


class ModelInfoResponse(BaseModel):
    model_type: str
    n_features: int
    feature_names: List[str]
    scaler_type: str
    description: str


class DatasetStatsResponse(BaseModel):
    total_records: int
    cardio_positive_count: int
    cardio_negative_count: int
    cardio_positive_percentage: float
    avg_age_years: float
    avg_bmi: float
    avg_ap_hi: float
    avg_ap_lo: float
