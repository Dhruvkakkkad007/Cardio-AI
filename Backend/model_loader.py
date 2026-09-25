import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, List, Tuple
from config import MODEL_PATH, SCALER_PATH, DATASET_PATH
from schemas import (
    PatientDataInput,
    PredictionResponse,
    FeatureContribution,
    BPCategoryInfo,
    DatasetStatsResponse
)

EXPECTED_FEATURES = [
    'gender', 'height', 'weight', 'ap_hi', 'ap_lo',
    'cholesterol', 'gluc', 'smoke', 'alco', 'active',
    'age_years', 'bmi'
]

FEATURE_LABELS = {
    'gender': 'Biological Sex',
    'height': 'Height (cm)',
    'weight': 'Weight (kg)',
    'ap_hi': 'Systolic Blood Pressure',
    'ap_lo': 'Diastolic Blood Pressure',
    'cholesterol': 'Serum Cholesterol Level',
    'gluc': 'Fasting Blood Glucose',
    'smoke': 'Smoking Habit',
    'alco': 'Alcohol Consumption',
    'active': 'Physical Activity',
    'age_years': 'Patient Age (years)',
    'bmi': 'Body Mass Index (BMI)'
}

class CardioModelService:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_loaded = False
        self.load_artifacts()

    def load_artifacts(self) -> bool:
        """Loads the trained Gradient Boosting model and StandardScaler from disk."""
        try:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
            if not SCALER_PATH.exists():
                raise FileNotFoundError(f"Scaler file not found at: {SCALER_PATH}")

            with open(MODEL_PATH, "rb") as f_model:
                self.model = pickle.load(f_model)

            with open(SCALER_PATH, "rb") as f_scaler:
                self.scaler = pickle.load(f_scaler)

            self.is_loaded = True
            print(f"Successfully loaded model and scaler from {MODEL_PATH.parent}")
            return True
        except Exception as e:
            print(f"Failed to load ML artifacts: {str(e)}")
            self.is_loaded = False
            return False

    @staticmethod
    def calculate_bmi(weight_kg: float, height_cm: float) -> float:
        """Calculates BMI in kg/m²."""
        if height_cm <= 0:
            return 0.0
        height_m = height_cm / 100.0
        return round(weight_kg / (height_m * height_m), 2)

    @staticmethod
    def get_bmi_category(bmi: float) -> str:
        """Returns standard WHO BMI category."""
        if bmi < 18.5:
            return "Underweight"
        elif bmi < 25.0:
            return "Normal Weight"
        elif bmi < 30.0:
            return "Overweight"
        elif bmi < 35.0:
            return "Obese (Class I)"
        else:
            return "Severely Obese (Class II+)"

    @staticmethod
    def get_bp_category(ap_hi: int, ap_lo: int) -> BPCategoryInfo:
        """Returns AHA blood pressure staging category."""
        hi, lo = int(ap_hi), int(ap_lo)
        if hi > 180 or lo > 120:
            return BPCategoryInfo(
                stage="Hypertensive Crisis",
                level=4,
                description="Emergency clinical consultation required immediately.",
                ap_hi=hi,
                ap_lo=lo
            )
        elif hi >= 140 or lo >= 90:
            return BPCategoryInfo(
                stage="Hypertension Stage 2",
                level=3,
                description="Consistent with clinical Stage 2 HTN criteria.",
                ap_hi=hi,
                ap_lo=lo
            )
        elif (hi >= 130 and hi <= 139) or (lo >= 80 and lo <= 89):
            return BPCategoryInfo(
                stage="Hypertension Stage 1",
                level=2,
                description="Moderate vascular strain; lifestyle modification & monitoring advised.",
                ap_hi=hi,
                ap_lo=lo
            )
        elif (hi >= 120 and hi <= 129) and lo < 80:
            return BPCategoryInfo(
                stage="Elevated Blood Pressure",
                level=1,
                description="Slightly elevated above optimal baseline.",
                ap_hi=hi,
                ap_lo=lo
            )
        else:
            return BPCategoryInfo(
                stage="Normal Blood Pressure",
                level=0,
                description="Optimal pressure (< 120/80 mmHg).",
                ap_hi=hi,
                ap_lo=lo
            )

    def generate_recommendations(
        self, patient: PatientDataInput, bmi: float, bp_info: BPCategoryInfo, risk_prob: float
    ) -> List[str]:
        """Generates patient-specific actionable health recommendations."""
        recs = []
        if patient.ap_hi >= 130 or patient.ap_lo >= 80:
            recs.append(
                f"Blood Pressure Management: Systolic BP is {patient.ap_hi} mmHg ({bp_info.stage}). "
                "Reduce sodium intake and consult a physician."
            )
        if patient.cholesterol > 1:
            recs.append(
                f"Lipid Profile Notice: Cholesterol level {patient.cholesterol} increases vascular plaque risk. "
                "Consider a lipid panel evaluation."
            )
        if bmi >= 25.0:
            recs.append(
                f"Weight Management: Calculated BMI is {bmi} kg/m² ({self.get_bmi_category(bmi)}). "
                "A balanced caloric diet and routine exercise can help reduce cardiovascular strain."
            )
        if patient.active == 0:
            recs.append(
                "Physical Activity: Patient is sedentary. Incorporate at least 150 minutes of moderate exercise per week."
            )
        if patient.smoke == 1:
            recs.append(
                "Smoking Cessation: Tobacco smoking significantly elevates acute arterial stress. Cessation is strongly recommended."
            )
        if not recs:
            recs.append("Optimal Biomarkers: Patient metrics are in healthy ranges. Maintain annual clinical checkups.")

        return recs

    def calculate_feature_contributions(
        self, input_values: Dict[str, float], scaled_vector: np.ndarray
    ) -> List[FeatureContribution]:
        """Calculates normalized feature contributions for model explainability."""
        contributions = []
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        else:
            importances = np.ones(len(EXPECTED_FEATURES)) / len(EXPECTED_FEATURES)

        for idx, feat in enumerate(EXPECTED_FEATURES):
            scaled_val = scaled_vector[0][idx]
            importance = importances[idx]
            effect = round(scaled_val * importance, 4)
            impact = "elevates risk" if effect > 0.02 else ("reduces risk" if effect < -0.02 else "neutral")
            
            contributions.append(
                FeatureContribution(
                    feature=feat,
                    label=FEATURE_LABELS.get(feat, feat),
                    value=round(input_values[feat], 2),
                    effect=effect,
                    impact=impact
                )
            )

        contributions.sort(key=lambda x: abs(x.effect), reverse=True)
        return contributions

    def predict(self, patient: PatientDataInput) -> PredictionResponse:
        """Executes model pipeline to calculate CVD risk prediction."""
        if not self.is_loaded:
            if not self.load_artifacts():
                raise RuntimeError("ML Model artifacts are not loaded.")

        # Calculate BMI if omitted
        bmi = patient.bmi if patient.bmi is not None else self.calculate_bmi(patient.weight, patient.height)

        # Prepare feature values dictionary
        input_dict = {
            'gender': float(patient.gender),
            'height': float(patient.height),
            'weight': float(patient.weight),
            'ap_hi': float(patient.ap_hi),
            'ap_lo': float(patient.ap_lo),
            'cholesterol': float(patient.cholesterol),
            'gluc': float(patient.gluc),
            'smoke': float(patient.smoke),
            'alco': float(patient.alco),
            'active': float(patient.active),
            'age_years': float(patient.age_years),
            'bmi': float(bmi)
        }

        # Convert to pandas DataFrame with exact column names expected by Scaler
        df_vector = pd.DataFrame([{feat: input_dict[feat] for feat in EXPECTED_FEATURES}])

        # Scale features
        scaled_vector = self.scaler.transform(df_vector)

        # Model Inference
        raw_pred = self.model.predict(scaled_vector)[0]
        prediction = int(raw_pred)

        if hasattr(self.model, "predict_proba"):
            probabilities = self.model.predict_proba(scaled_vector)[0]
            risk_prob = float(probabilities[1])
        else:
            risk_prob = 1.0 if prediction == 1 else 0.0

        risk_percent = round(risk_prob * 100, 1)

        # Stratify Risk Tier
        if risk_percent >= 65.0:
            risk_tier = "High Risk"
        elif risk_percent >= 35.0:
            risk_tier = "Moderate Risk"
        else:
            risk_tier = "Low Risk"

        prediction_label = "High Risk" if prediction == 1 else "Low Risk"
        bmi_cat = self.get_bmi_category(bmi)
        bp_info = self.get_bp_category(patient.ap_hi, patient.ap_lo)
        recommendations = self.generate_recommendations(patient, bmi, bp_info, risk_prob)
        contributions = self.calculate_feature_contributions(input_dict, scaled_vector)

        return PredictionResponse(
            prediction=prediction,
            prediction_label=prediction_label,
            risk_probability=round(risk_prob, 4),
            risk_percentage=risk_percent,
            risk_tier=risk_tier,
            bmi=bmi,
            bmi_category=bmi_cat,
            bp_category=bp_info,
            recommendations=recommendations,
            feature_contributions=contributions
        )

    def get_dataset_stats(self) -> DatasetStatsResponse:
        """Returns statistics from the cleaned dataset."""
        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Dataset file not found at: {DATASET_PATH}")

        df = pd.read_csv(DATASET_PATH)
        total = len(df)
        pos = int(df['cardio'].sum())
        neg = total - pos
        pos_pct = round((pos / total) * 100, 2)
        avg_age = round(float(df['age_years'].mean()), 2)
        avg_bmi = round(float(df['bmi'].mean()), 2)
        avg_ap_hi = round(float(df['ap_hi'].mean()), 2)
        avg_ap_lo = round(float(df['ap_lo'].mean()), 2)

        return DatasetStatsResponse(
            total_records=total,
            cardio_positive_count=pos,
            cardio_negative_count=neg,
            cardio_positive_percentage=pos_pct,
            avg_age_years=avg_age,
            avg_bmi=avg_bmi,
            avg_ap_hi=avg_ap_hi,
            avg_ap_lo=avg_ap_lo
        )


# Global Service Singleton
model_service = CardioModelService()
