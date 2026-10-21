"""Unit tests for input validation and model predictions."""

import pytest
import numpy as np
import pandas as pd
from src.predict import validate_input, predict_species, FEATURE_BOUNDS


def test_validate_input_valid():
    """Verifies that valid floats pass validation and return correct DataFrame."""
    df = validate_input(5.1, 3.5, 1.4, 0.2)
    assert isinstance(df, pd.DataFrame)
    assert df.shape == (1, 4)
    assert df.loc[0, "sepal_length"] == 5.1
    assert df.loc[0, "sepal_width"] == 3.5
    assert df.loc[0, "petal_length"] == 1.4
    assert df.loc[0, "petal_width"] == 0.2


def test_validate_input_numeric_strings():
    """Verifies that numeric strings are safely cast to floats."""
    df = validate_input("6.0", "3.0", "4.5", "1.5")
    assert df.loc[0, "sepal_length"] == 6.0
    assert df.loc[0, "sepal_width"] == 3.0


def test_validate_input_non_numeric():
    """Verifies that non-numeric strings trigger a TypeError."""
    with pytest.raises(TypeError, match="must be a valid numeric"):
        validate_input("invalid", 3.0, 4.0, 1.0)


def test_validate_input_none_value():
    """Verifies that None triggers a ValueError."""
    with pytest.raises(ValueError, match="cannot be None"):
        validate_input(5.0, None, 1.4, 0.2)


def test_validate_input_negative():
    """Verifies that negative values trigger a ValueError."""
    with pytest.raises(ValueError, match="strictly positive"):
        validate_input(-5.0, 3.0, 1.4, 0.2)


def test_validate_input_zero():
    """Verifies that zero triggers a ValueError."""
    with pytest.raises(ValueError, match="strictly positive"):
        validate_input(0.0, 3.0, 1.4, 0.2)


def test_validate_input_out_of_bounds():
    """Verifies that biological outlier inputs trigger a ValueError."""
    # Exceedingly large sepal length (e.g. 50 cm)
    with pytest.raises(ValueError, match="outside plausible botanical range"):
        validate_input(55.0, 3.0, 1.4, 0.2, check_bounds=True)


def test_predict_species_setosa():
    """Verifies that classic Setosa measurements classify as Setosa."""
    res = predict_species(5.0, 3.4, 1.5, 0.2)
    assert res["species"] == "setosa"
    assert res["predicted_class"] == 0
    assert "probabilities" in res
    assert res["probabilities"]["setosa"] > 0.8
    # Probabilities must sum close to 1
    total_prob = sum(res["probabilities"].values())
    assert abs(total_prob - 1.0) < 0.05


def test_predict_species_virginica():
    """Verifies that classic Virginica measurements classify as Virginica."""
    res = predict_species(7.2, 3.2, 6.0, 2.2)
    assert res["species"] == "virginica"
    assert res["predicted_class"] == 2
    assert res["probabilities"]["virginica"] > 0.7
