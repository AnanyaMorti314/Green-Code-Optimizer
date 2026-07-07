import joblib
import numpy as np
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'green_score_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'models', 'scaler.pkl')

# Load model on startup
model = None
scaler = None

def load_model():
    global model, scaler
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        scaler = joblib.load(SCALER_PATH)
        print(f"✅ ML model loaded from {MODEL_PATH}")
    else:
        print("⚠️  ML model not found — using heuristic scoring")

load_model()

FEATURE_ORDER = [
    'loc', 'cyclomatic_complexity', 'max_nested_loops',
    'memory_allocations', 'io_operations', 'recursive_calls',
    'inefficient_patterns', 'function_count', 'class_count',
    'global_variables', 'comprehension_count'
]

LANG_ENCODING = {'python': 0, 'java': 1, 'c': 2, 'cpp': 3}

def predict_green_score(features: dict, language: str) -> float:
    """Predict green score (0-100) from extracted code features."""
    if model is None:
        return heuristic_score(features)

    try:
        feat_vector = [features.get(f, 0) for f in FEATURE_ORDER]
        feat_vector.append(LANG_ENCODING.get(language, 0))
        X = np.array(feat_vector).reshape(1, -1)
        X_scaled = scaler.transform(X)
        score = model.predict(X_scaled)[0]
        return float(np.clip(score, 0, 100))
    except Exception as e:
        print(f"Model prediction error: {e} — using heuristic")
        return heuristic_score(features)

def heuristic_score(features: dict) -> float:
    """Fallback heuristic if model not loaded."""
    score = 100.0
    score -= min(features.get('max_nested_loops', 0) * 15, 40)
    score -= min(features.get('cyclomatic_complexity', 1) * 0.5, 20)
    score -= min(features.get('recursive_calls', 0) * 5, 15)
    score -= min(features.get('io_operations', 0) * 0.5, 10)
    score -= min(features.get('inefficient_patterns', 0) * 3, 10)
    score += min(features.get('comprehension_count', 0) * 2, 5)
    return float(np.clip(score, 0, 100))