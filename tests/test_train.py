"""Unit tests for training pipelines, stratified split, and model persistence."""

from pathlib import Path
import joblib
import numpy as np
import pytest
from sklearn.pipeline import Pipeline

from src.train import (
    RANDOM_STATE,
    TEST_SIZE,
    create_candidate_pipelines,
    train_and_evaluate_all,
)
from src.data_loader import load_iris_data


def test_create_candidate_pipelines():
    """Verifies candidate pipelines dictionary structure and components."""
    pipelines = create_candidate_pipelines()
    assert "Baseline (Stratified Dummy)" in pipelines
    assert "Logistic Regression" in pipelines
    assert "Random Forest" in pipelines
    assert "K-Nearest Neighbors" in pipelines
    
    for name, pipe in pipelines.items():
        assert isinstance(pipe, Pipeline)


def test_train_and_evaluate_workflow(tmp_path: Path):
    """Executes full training run and verifies output artifacts."""
    summary, champion, model_path = train_and_evaluate_all()
    
    assert Path(model_path).exists()
    assert champion in ["Logistic Regression", "Random Forest", "K-Nearest Neighbors"]
    
    # Verify metrics structure
    assert "experiment_config" in summary
    assert "models" in summary
    assert summary["experiment_config"]["test_samples"] == 30
    assert summary["experiment_config"]["train_samples"] == 120
    
    # Check that model performance is evaluated and valid
    for model_name, m in summary["models"].items():
        assert 0.0 <= m["test_accuracy"] <= 1.0
        assert 0.0 <= m["test_f1_macro"] <= 1.0
        assert len(m["confusion_matrix"]) == 3
    
    # Verify baseline is notably lower than tuned models
    baseline_acc = summary["models"]["Baseline (Stratified Dummy)"]["test_accuracy"]
    lr_acc = summary["models"]["Logistic Regression"]["test_accuracy"]
    assert lr_acc > baseline_acc
    
    # Verify loaded joblib file
    artifact = joblib.load(model_path)
    assert "pipeline" in artifact
    assert "target_names" in artifact
