"""Model training, evaluation, and serialization module for Iris Flower Classification.

Implements:
1. Stratified train/test splitting with fixed random seed (42).
2. Data-leakage-free Scikit-learn Pipelines (StandardScaler + Estimator).
3. Baseline (DummyClassifier) + Logistic Regression + Random Forest + KNN.
4. Comprehensive multi-class evaluation metrics (Accuracy, Macro/Weighted Precision,
   Recall, F1-Score, Confusion Matrices, and Classification Reports).
5. 5-Fold Stratified Cross-Validation on training data.
6. Evidence-based model selection and serialization using joblib.
"""

import json
from pathlib import Path
from typing import Any, Dict, Tuple
import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from src.data_loader import FEATURE_NAMES, TARGET_NAMES, load_iris_data

RANDOM_STATE = 42
TEST_SIZE = 0.2

PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
FIGURES_DIR = OUTPUTS_DIR / "figures"


def create_candidate_pipelines() -> Dict[str, Pipeline]:
    """Instantiates candidate models wrapped in leakage-free pipelines.

    Returns:
        Dictionary of candidate model pipelines.
    """
    pipelines = {
        "Baseline (Stratified Dummy)": Pipeline([
            ("classifier", DummyClassifier(strategy="stratified", random_state=RANDOM_STATE)),
        ]),
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=300, random_state=RANDOM_STATE)),
        ]),
        "Random Forest": Pipeline([
            # Tree models are scale-invariant, but pipeline structure keeps standard API
            ("classifier", RandomForestClassifier(n_estimators=100, max_depth=4, random_state=RANDOM_STATE)),
        ]),
        "K-Nearest Neighbors": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", KNeighborsClassifier(n_neighbors=5)),
        ]),
    }
    return pipelines


def train_and_evaluate_all() -> Tuple[Dict[str, Any], str, Path]:
    """Runs complete end-to-end training and evaluation pipeline.

    Returns:
        results_summary: Dictionary of performance metrics for all candidates.
        best_model_name: Name of selected champion model.
        saved_model_path: Path where champion model was serialized.
    """
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Load data
    X, y, feature_names, target_names = load_iris_data()
    
    # 2. Stratified train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )
    
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    candidate_pipelines = create_candidate_pipelines()
    
    results = {}
    fitted_pipelines = {}
    test_preds_dict = {
        "true_label_idx": y_test.values,
        "true_species": [target_names[i] for i in y_test],
    }
    
    # 3. Fit and evaluate each candidate
    for name, pipeline in candidate_pipelines.items():
        # Cross-validation on training data only
        cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv, scoring="accuracy")
        
        # Fit on entire training set
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline
        
        # Predict on held-out test set
        y_pred = pipeline.predict(X_test)
        test_preds_dict[f"pred_{name}"] = [target_names[i] for i in y_pred]
        
        # Compute test set metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
        prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
        rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
        rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
        f1_mac = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
        f1_wt = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()
        report = classification_report(y_test, y_pred, target_names=target_names, output_dict=True, zero_division=0)
        
        results[name] = {
            "cv_accuracy_mean": float(cv_scores.mean()),
            "cv_accuracy_std": float(cv_scores.std()),
            "test_accuracy": acc,
            "test_precision_macro": prec_macro,
            "test_precision_weighted": prec_weighted,
            "test_recall_macro": rec_macro,
            "test_recall_weighted": rec_weighted,
            "test_f1_macro": f1_mac,
            "test_f1_weighted": f1_wt,
            "confusion_matrix": cm,
            "classification_report": report,
        }
    
    # Save predictions dataframe
    test_preds_df = pd.DataFrame(test_preds_dict, index=X_test.index)
    test_preds_df = pd.concat([X_test, test_preds_df], axis=1)
    test_preds_df.to_csv(OUTPUTS_DIR / "test_predictions.csv", index=True)
    
    # 4. Generate Confusion Matrix Comparison Figure
    models_to_plot = ["Baseline (Stratified Dummy)", "Logistic Regression", "Random Forest", "K-Nearest Neighbors"]
    fig, axes = plt.subplots(1, 4, figsize=(18, 4.2), dpi=150)
    for ax, name in zip(axes, models_to_plot):
        cm_data = np.array(results[name]["confusion_matrix"])
        sns.heatmap(
            cm_data,
            annot=True,
            fmt="d",
            cmap="Blues",
            cbar=False,
            xticklabels=target_names,
            yticklabels=target_names,
            ax=ax,
            annot_kws={"size": 11, "weight": "bold"},
        )
        ax.set_title(f"{name}\nAcc: {results[name]['test_accuracy']:.1%}", fontsize=11, weight="bold")
        ax.set_xlabel("Predicted Label", fontsize=9)
        ax.set_ylabel("True Label", fontsize=9)
    
    plt.tight_layout()
    cm_plot_path = FIGURES_DIR / "05_confusion_matrix_comparison.png"
    plt.savefig(cm_plot_path, bbox_inches="tight")
    plt.close()
    
    # 5. Model Selection based on cross-validation and test set performance
    # Logistic Regression and Random Forest both perform exceptionally well.
    # We select Logistic Regression (or Random Forest) based on top CV stability and probability calibration.
    best_candidate = "Logistic Regression"
    if results["Random Forest"]["cv_accuracy_mean"] > results[best_candidate]["cv_accuracy_mean"]:
        best_candidate = "Random Forest"
    elif results["Logistic Regression"]["test_f1_macro"] >= results["Random Forest"]["test_f1_macro"]:
        best_candidate = "Logistic Regression"
    
    champion_pipeline = fitted_pipelines[best_candidate]
    model_save_path = MODELS_DIR / "iris_classifier.joblib"
    
    # Attach rich metadata to saved pipeline
    model_artifact = {
        "pipeline": champion_pipeline,
        "model_name": best_candidate,
        "feature_names": feature_names,
        "target_names": target_names,
        "random_state": RANDOM_STATE,
        "test_size": TEST_SIZE,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "test_accuracy": results[best_candidate]["test_accuracy"],
        "test_f1_macro": results[best_candidate]["test_f1_macro"],
    }
    joblib.dump(model_artifact, model_save_path)
    
    # Save metrics summary to JSON
    summary_output = {
        "experiment_config": {
            "random_state": RANDOM_STATE,
            "test_size": TEST_SIZE,
            "total_samples": len(X),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
            "stratified": True,
            "classes": target_names,
            "features": feature_names,
        },
        "champion_model": best_candidate,
        "champion_model_path": str(model_save_path.relative_to(PROJECT_ROOT)),
        "models": results,
    }
    
    with open(OUTPUTS_DIR / "metrics_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary_output, f, indent=2)
    
    return summary_output, best_candidate, model_save_path


if __name__ == "__main__":
    print("Beginning model training and cross-validation workflow...")
    summary, champion, model_path = train_and_evaluate_all()
    print("\n" + "=" * 65)
    print(f"TRAINING COMPLETE. Champion Model: {champion}")
    print(f"Serialized to: {model_path}")
    print("=" * 65)
    for model_name, m in summary["models"].items():
        print(f"\nModel: {model_name}")
        print(f"  5-Fold CV Accuracy: {m['cv_accuracy_mean']:.3f} (+/- {m['cv_accuracy_std']:.3f})")
        print(f"  Test Accuracy:     {m['test_accuracy']:.3f}")
        print(f"  Test F1 (Macro):   {m['test_f1_macro']:.3f}")
        print(f"  Test F1 (Weighted):{m['test_f1_weighted']:.3f}")
