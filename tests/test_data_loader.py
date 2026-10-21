"""Unit tests for the data loader and integrity checks."""

import tempfile
from pathlib import Path
import numpy as np
import pandas as pd
import pytest

from src.data_loader import (
    FEATURE_NAMES,
    TARGET_NAMES,
    get_dataset_summary,
    load_iris_data,
    save_raw_data_csv,
)


def test_load_iris_data_shape_and_types():
    """Verifies that the canonical dataset contains 150 samples and 4 features."""
    X, y, feature_names, target_names = load_iris_data()
    
    assert isinstance(X, pd.DataFrame)
    assert isinstance(y, pd.Series)
    assert X.shape == (150, 4)
    assert len(y) == 150
    assert feature_names == FEATURE_NAMES
    assert target_names == TARGET_NAMES


def test_no_missing_values():
    """Verifies that the dataset has zero missing or null entries."""
    X, y, _, _ = load_iris_data()
    assert X.isna().sum().sum() == 0
    assert y.isna().sum() == 0


def test_balanced_target_distribution():
    """Verifies that each class has exactly 50 samples."""
    _, y, _, _ = load_iris_data()
    counts = y.value_counts().to_dict()
    assert counts[0] == 50
    assert counts[1] == 50
    assert counts[2] == 50


def test_dataset_summary_structure():
    """Verifies that the summary helper computes the expected metrics."""
    X, y, _, target_names = load_iris_data()
    summary = get_dataset_summary(X, y, target_names)
    
    assert summary["num_samples"] == 150
    assert summary["num_features"] == 4
    assert summary["missing_values_total"] == 0
    assert summary["duplicate_rows_in_features"] == 1
    assert "descriptive_statistics" in summary


def test_save_raw_data_csv(tmp_path: Path):
    """Verifies that saving the CSV produces a valid, reloadable file."""
    temp_file = tmp_path / "iris_test.csv"
    saved = save_raw_data_csv(temp_file)
    assert saved.exists()
    
    df = pd.read_csv(saved)
    assert len(df) == 150
    assert all(col in df.columns for col in FEATURE_NAMES + ["target", "species"])
