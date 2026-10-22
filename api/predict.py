"""Vercel Serverless Function for Iris Flower Classification.

Endpoint: /api/predict
Accepts:
- GET: API health check, metadata, and parameter requirements.
- POST: JSON payload with { sepal_length, sepal_width, petal_length, petal_width } in cm.
"""

from http.server import BaseHTTPRequestHandler
import json
import math
import sys
from pathlib import Path

# Add project root to path for local module resolution
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

SPECIES = ["setosa", "versicolor", "virginica"]
DISPLAY_NAMES = {
    "setosa": "Iris setosa",
    "versicolor": "Iris versicolor",
    "virginica": "Iris virginica",
}

FEATURE_BOUNDS = {
    "sepal_length": (1.0, 15.0),
    "sepal_width": (1.0, 10.0),
    "petal_length": (0.5, 15.0),
    "petal_width": (0.05, 10.0),
}

# Parameters from scikit-learn LogisticRegression pipeline (seed 42)
MODEL_PARAMETERS = {
    "scaler_mean": [5.841666666666667, 3.048333333333333, 3.77, 1.205],
    "scaler_scale": [0.8374150039788449, 0.44665111913239647, 1.7611359970201053, 0.7594789880788891],
    "coef": [
        [-1.0889449397829571, 1.0242076281023333, -1.7990560892687026, -1.6862281947599056],
        [0.5363365389098398, -0.36048698211755004, -0.20407418434232835, -0.8079570305810982],
        [0.5526084008731174, -0.6637206459847838, 2.003130273611031, 2.4941852253410035],
    ],
    "intercept": [-0.30558672176868484, 1.9085555441430444, -1.6029688223743603],
}

_MODEL_CACHE = None


def load_scikit_model():
    """Attempt to load the serialized scikit-learn joblib pipeline."""
    global _MODEL_CACHE
    if _MODEL_CACHE is not None:
        return _MODEL_CACHE

    candidates = [
        BASE_DIR / "models" / "iris_classifier.joblib",
        Path(__file__).resolve().parent / "models" / "iris_classifier.joblib",
        Path("/var/task/models/iris_classifier.joblib"),
    ]

    for p in candidates:
        if p.exists():
            try:
                import joblib
                loaded = joblib.load(p)
                pipeline = loaded.get("pipeline", loaded) if isinstance(loaded, dict) else loaded
                _MODEL_CACHE = pipeline
                return _MODEL_CACHE
            except Exception:
                pass
    return None


def run_inference(sepal_length: float, sepal_width: float, petal_length: float, petal_width: float):
    """Run prediction with scikit-learn pipeline or mathematical model weights."""
    features = [sepal_length, sepal_width, petal_length, petal_width]
    pipeline = load_scikit_model()

    if pipeline is not None:
        try:
            import pandas as pd
            df = pd.DataFrame([features], columns=["sepal_length", "sepal_width", "petal_length", "petal_width"])
            pred_idx = int(pipeline.predict(df)[0])
            probs_arr = pipeline.predict_proba(df)[0]
            species = SPECIES[pred_idx]
            return {
                "engine": "Python Scikit-Learn Pipeline (.joblib)",
                "predicted_class": pred_idx,
                "species": species,
                "display_name": DISPLAY_NAMES[species],
                "confidence": float(round(probs_arr[pred_idx], 4)),
                "probabilities": {
                    s: float(round(p, 4)) for s, p in zip(SPECIES, probs_arr)
                },
            }
        except Exception:
            pass

    # Exact mathematical inference
    means = MODEL_PARAMETERS["scaler_mean"]
    scales = MODEL_PARAMETERS["scaler_scale"]
    z = [(f - m) / s for f, m, s in zip(features, means, scales)]

    scores = []
    for coef_row, intercept in zip(MODEL_PARAMETERS["coef"], MODEL_PARAMETERS["intercept"]):
        score = intercept + sum(c * val for c, val in zip(coef_row, z))
        scores.append(score)

    max_score = max(scores)
    exp_scores = [math.exp(s - max_score) for s in scores]
    sum_exp = sum(exp_scores)
    probs = [e / sum_exp for e in exp_scores]

    best_idx = int(max(range(len(probs)), key=lambda i: probs[i]))
    species = SPECIES[best_idx]

    return {
        "engine": "Python Scikit-Learn Exact Model Weights",
        "predicted_class": best_idx,
        "species": species,
        "display_name": DISPLAY_NAMES[species],
        "confidence": float(round(probs[best_idx], 4)),
        "probabilities": {
            s: float(round(p, 4)) for s, p in zip(SPECIES, probs)
        },
    }


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code: int, data: dict):
        body = json.dumps(data, indent=2).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        self._send_json(200, {
            "status": "online",
            "service": "Iris Flower Classification API",
            "runtime": f"Python {sys.version.split()[0]} (Vercel Serverless)",
            "classes": SPECIES,
            "feature_bounds_cm": FEATURE_BOUNDS,
            "usage": {
                "method": "POST",
                "endpoint": "/api/predict",
                "example_body": {
                    "sepal_length": 5.1,
                    "sepal_width": 3.5,
                    "petal_length": 1.4,
                    "petal_width": 0.2
                }
            }
        })

    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length <= 0:
                self._send_json(400, {"error": "Empty request body. Send JSON flower measurements."})
                return

            raw_body = self.rfile.read(content_length).decode("utf-8")
            payload = json.loads(raw_body)
        except Exception as e:
            self._send_json(400, {"error": f"Invalid JSON body: {str(e)}"})
            return

        validated = {}
        for feat in ["sepal_length", "sepal_width", "petal_length", "petal_width"]:
            if feat not in payload:
                self._send_json(400, {"error": f"Missing required parameter '{feat}'."})
                return
            try:
                val = float(payload[feat])
            except (ValueError, TypeError):
                self._send_json(400, {"error": f"Field '{feat}' must be a numeric number."})
                return

            if math.isnan(val) or math.isinf(val) or val <= 0:
                self._send_json(400, {"error": f"Field '{feat}' must be a positive finite number."})
                return

            min_b, max_b = FEATURE_BOUNDS[feat]
            if not (min_b <= val <= max_b):
                self._send_json(400, {
                    "error": f"Field '{feat}' ({val} cm) is outside botanical bounds [{min_b}, {max_b}] cm."
                })
                return

            validated[feat] = val

        result = run_inference(
            validated["sepal_length"],
            validated["sepal_width"],
            validated["petal_length"],
            validated["petal_width"],
        )

        response = {
            "status": "success",
            "inputs": validated,
            **result,
        }
        self._send_json(200, response)
