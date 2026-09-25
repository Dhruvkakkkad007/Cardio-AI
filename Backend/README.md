# CardioAI - FastAPI Backend Service 🫀

Production-ready FastAPI backend for **Cardiovascular Disease (CVD) Risk Stratification & Predictive Analytics**.  
Integrates trained Machine Learning models (`GradientBoostingClassifier` & `StandardScaler`) trained on over 68,000 patient records (`cardio_cleaned.csv`).

---

## 📁 Backend Architecture & Directory Structure

```text
Backend/
├── main.py            # FastAPI application entry point, CORS middleware, and API endpoints
├── model_loader.py    # ML Inference Service: loads models, calculates BMI, AHA BP staging & recommendations
├── schemas.py         # Pydantic v2 data models for strict input validation & schema responses
├── config.py          # Environment configuration & artifact file path definitions
├── test_api.py        # Pytest test suite for endpoint verification
├── requirements.txt   # Python dependencies list
└── README.md          # Project documentation (this file)
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
Open a terminal in the `Backend` directory and install required Python packages:
```bash
pip install -r requirements.txt
```

### 2. Run the FastAPI Server
Launch the server with live reload:
```bash
python main.py
```
*Or using uvicorn directly:*
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The server will start at: `http://127.0.0.1:8000`

---

## 📖 Interactive Documentation

Once the server is running, access the auto-generated interactive documentation:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## 🔌 API Endpoints Reference

### 1. Root & Health
- `GET /` - API Welcome & status message
- `GET /health` - Health check endpoint verifying ML model and scaler status

### 2. Risk Prediction Engine
- `POST /predict` - Single Patient CVD Risk Stratification
  - **Request Payload:**
    ```json
    {
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
    ```
  - **Response Payload:**
    ```json
    {
      "prediction": 1,
      "prediction_label": "High Risk",
      "risk_probability": 0.5652,
      "risk_percentage": 56.5,
      "risk_tier": "Moderate Risk",
      "bmi": 26.99,
      "bmi_category": "Overweight",
      "bp_category": {
        "stage": "Hypertension Stage 1",
        "level": 2,
        "description": "Moderate vascular strain; lifestyle modification & monitoring advised.",
        "ap_hi": 130,
        "ap_lo": 85
      },
      "recommendations": [
        "Blood Pressure Management: Systolic BP is 130 mmHg (Hypertension Stage 1)...",
        "Lipid Profile Notice: Cholesterol level 2 increases vascular plaque risk..."
      ],
      "feature_contributions": [...]
    }
    ```

- `POST /batch-predict` - Batch prediction for multiple patients in a single HTTP request.

### 3. Model & Dataset Analytics
- `GET /model-info` - Returns details about the loaded model architecture and feature requirements.
- `GET /dataset-stats` - Returns summary statistics computed directly from `cardio_cleaned.csv` (total records, CVD prevalence %, average biometrics).

---

## 🧪 Running Unit Tests

Run the test suite with pytest:
```bash
pytest test_api.py -v
```

---

## 🛠️ Key Input Feature Definitions

| Feature | Type | Range / Options | Description |
| :--- | :--- | :--- | :--- |
| `age_years` | Float/Int | 10 - 120 | Patient age in years |
| `gender` | Int | `0`: Female, `1`: Male | Biological sex |
| `height` | Float | 100 - 250 | Height in centimeters |
| `weight` | Float | 30 - 250 | Weight in kilograms |
| `ap_hi` | Int | 60 - 240 | Systolic Blood Pressure (mmHg) |
| `ap_lo` | Int | 30 - 180 | Diastolic Blood Pressure (mmHg) |
| `cholesterol` | Int | `1`: Normal, `2`: Above Normal, `3`: High | Serum Cholesterol Level |
| `gluc` | Int | `1`: Normal, `2`: Above Normal, `3`: High | Fasting Blood Glucose |
| `smoke` | Int | `0`: Non-smoker, `1`: Smoker | Smoking habit |
| `alco` | Int | `0`: No, `1`: Yes | Alcohol intake |
| `active` | Int | `0`: Sedentary, `1`: Active | Physical activity status |
| `bmi` | Float | Optional | Auto-calculated if omitted |
