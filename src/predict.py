"""Reusable prediction and input validation module for Iris Flower Classification.

Validates four numeric flower measurement inputs and generates species predictions
with calibrated probabilities using the trained scikit-learn pipeline.
"""

import argparse
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import joblib
import numpy as np
import pandas as pd

from src.data_loader import FEATURE_NAMES, TARGET_NAMES

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_MODEL_PATH = PROJECT_ROOT / "models" / "iris_classifier.joblib"

# Biologically plausible bounds in centimeters for botanical validation
FEATURE_BOUNDS = {
    "sepal_length": (1.0, 15.0),
    "sepal_width": (1.0, 10.0),
    "petal_length": (0.5, 15.0),
    "petal_width": (0.05, 10.0),
}

_LOADED_MODEL_CACHE: Optional[Dict[str, Any]] = None


def get_model(model_path: Optional[Union[Path, str]] = None) -> Dict[str, Any]:
    """Loads and caches the serialized model artifact.

    Args:
        model_path: Path to serialized joblib model.

    Returns:
        Dictionary containing pipeline and metadata.

    Raises:
        FileNotFoundError: If the model file cannot be found.
    """
    global _LOADED_MODEL_CACHE
    path = Path(model_path) if model_path else DEFAULT_MODEL_PATH
    
    if _LOADED_MODEL_CACHE is not None and model_path is None:
        return _LOADED_MODEL_CACHE
    
    if not path.exists():
        raise FileNotFoundError(
            f"Trained model not found at '{path}'. "
            "Please train the model first by running: python -m src.train"
        )
    
    loaded = joblib.load(path)
    if isinstance(loaded, dict) and "pipeline" in loaded:
        artifact = loaded
    else:
        # Fallback if raw pipeline was saved
        artifact = {
            "pipeline": loaded,
            "feature_names": FEATURE_NAMES,
            "target_names": TARGET_NAMES,
            "model_name": "Pipeline",
        }
    
    if model_path is None:
        _LOADED_MODEL_CACHE = artifact
    return artifact


def validate_input(
    sepal_length: Any,
    sepal_width: Any,
    petal_length: Any,
    petal_width: Any,
    check_bounds: bool = True,
) -> pd.DataFrame:
    """Validates the four botanical inputs for Iris species prediction.

    Ensures that all inputs are non-null, finite numeric numbers, strictly positive,
    and optionally within realistic biological boundaries.

    Args:
        sepal_length: Sepal length in centimeters.
        sepal_width: Sepal width in centimeters.
        petal_length: Petal length in centimeters.
        petal_width: Petal width in centimeters.
        check_bounds: Whether to verify values are within biologically plausible bounds.

    Returns:
        DataFrame with shape (1, 4) and canonical column names.

    Raises:
        TypeError: If any input cannot be converted to float.
        ValueError: If any input is non-positive, NaN, infinite, or out of bounds.
    """
    inputs = {
        "sepal_length": sepal_length,
        "sepal_width": sepal_width,
        "petal_length": petal_length,
        "petal_width": petal_width,
    }
    
    validated_vals: Dict[str, float] = {}
    
    for feat_name, raw_val in inputs.items():
        if raw_val is None:
            raise ValueError(f"Input '{feat_name}' cannot be None.")
        
        # Check numeric conversion
        try:
            val = float(raw_val)
        except (ValueError, TypeError) as err:
            raise TypeError(
                f"Feature '{feat_name}' must be a valid numeric number, got {type(raw_val).__name__} ({raw_val!r})."
            ) from err
        
        # Check finite and non-NaN
        if np.isnan(val) or np.isinf(val):
            raise ValueError(f"Feature '{feat_name}' must be a finite real number, got {val}.")
        
        # Check strictly positive
        if val <= 0:
            raise ValueError(
                f"Feature '{feat_name}' must be strictly positive (> 0 cm), got {val} cm."
            )
        
        # Check bounds
        if check_bounds:
            min_bound, max_bound = FEATURE_BOUNDS[feat_name]
            if not (min_bound <= val <= max_bound):
                raise ValueError(
                    f"Feature '{feat_name}' value {val} cm is outside plausible botanical range "
                    f"[{min_bound}, {max_bound}] cm."
                )
        
        validated_vals[feat_name] = val
    
    return pd.DataFrame([validated_vals], columns=FEATURE_NAMES)


def predict_species(
    sepal_length: Any,
    sepal_width: Any,
    petal_length: Any,
    petal_width: Any,
    model_path: Optional[Union[Path, str]] = None,
    check_bounds: bool = True,
) -> Dict[str, Any]:
    """Predicts the Iris species given sepal and petal measurements.

    Args:
        sepal_length: Sepal length in centimeters.
        sepal_width: Sepal width in centimeters.
        petal_length: Petal length in centimeters.
        petal_width: Petal width in centimeters.
        model_path: Optional override for model artifact path.
        check_bounds: Whether to validate input range limits.

    Returns:
        Dictionary with predicted class, species name, and probability distribution:
        {
            "predicted_class": int,
            "species": str,
            "probabilities": {"setosa": float, "versicolor": float, "virginica": float},
            "input_features": dict
        }
    """
    # 1. Validate inputs
    input_df = validate_input(
        sepal_length, sepal_width, petal_length, petal_width, check_bounds=check_bounds
    )
    
    # 2. Retrieve model artifact
    artifact = get_model(model_path)
    pipeline = artifact["pipeline"]
    target_names: List[str] = artifact.get("target_names", TARGET_NAMES)
    
    # 3. Generate prediction and probabilities
    pred_idx = int(pipeline.predict(input_df)[0])
    predicted_species = target_names[pred_idx]
    
    probabilities: Dict[str, float] = {}
    if hasattr(pipeline, "predict_proba"):
        probs = pipeline.predict_proba(input_df)[0]
        for idx, prob in enumerate(probs):
            name = target_names[idx] if idx < len(target_names) else f"class_{idx}"
            probabilities[name] = float(np.round(prob, 4))
    
    return {
        "predicted_class": pred_idx,
        "species": predicted_species,
        "probabilities": probabilities,
        "input_features": input_df.iloc[0].to_dict(),
        "model_used": artifact.get("model_name", "Fitted Pipeline"),
    }


def main():
    parser = argparse.ArgumentParser(
        description="Predict Iris species from sepal and petal measurements."
    )
    parser.add_argument("--sepal-length", type=float, required=True, help="Sepal length in cm")
    parser.add_argument("--sepal-width", type=float, required=True, help="Sepal width in cm")
    parser.add_argument("--petal-length", type=float, required=True, help="Petal length in cm")
    parser.add_argument("--petal-width", type=float, required=True, help="Petal width in cm")
    parser.add_argument("--model-path", type=str, default=None, help="Custom model path")
    
    args = parser.parse_args()
    
    try:
        result = predict_species(
            args.sepal_length,
            args.sepal_width,
            args.petal_length,
            args.petal_width,
            model_path=args.model_path,
        )
        print("\n" + "=" * 50)
        print("IRIS SPECIES PREDICTION RESULT")
        print("=" * 50)
        print(f"Predicted Species:  {result['species'].capitalize()}")
        print(f"Class Index:        {result['predicted_class']}")
        print(f"Model Employed:     {result['model_used']}")
        print("\nProbability Distribution:")
        for sp, prob in result["probabilities"].items():
            print(f"  • {sp.capitalize():<12}: {prob * 100:>6.2f}%")
        print("=" * 50)
    except Exception as exc:
        print(f"\n[ERROR] Prediction failed: {exc}")
        exit(1)


if __name__ == "__main__":
    main()
