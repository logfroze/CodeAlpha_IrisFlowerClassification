"""Data loading and inspection module for the Iris Flower Classification project.

Provides utilities to load the canonical Iris dataset from scikit-learn,
save local copies, check data integrity, and calculate descriptive statistics.
"""

from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
from sklearn.datasets import load_iris

FEATURE_NAMES: List[str] = [
    "sepal_length",
    "sepal_width",
    "petal_length",
    "petal_width",
]

TARGET_NAMES: List[str] = ["setosa", "versicolor", "virginica"]

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RAW_DATA_PATH = DATA_DIR / "iris.csv"


def load_iris_data(data_path: Path | str | None = None) -> Tuple[pd.DataFrame, pd.Series, List[str], List[str]]:
    """Loads the Iris dataset, ensuring consistent column naming and types.

    Prefers scikit-learn's built-in dataset to guarantee reproducibility and prevent
    external network dependencies. If a local CSV is explicitly provided and exists,
    it loads and parses that CSV.

    Args:
        data_path: Optional path to a local CSV file.

    Returns:
        X: Feature DataFrame with columns [sepal_length, sepal_width, petal_length, petal_width].
        y: Target Series with integer labels 0, 1, 2.
        feature_names: List of feature names.
        target_names: List of target class names.
    """
    if data_path is not None and Path(data_path).exists():
        raw_df = pd.read_csv(data_path)
        # Handle variations in column names from different sources
        col_map = {}
        for col in raw_df.columns:
            cleaned = col.lower().replace(" (cm)", "").replace(" ", "_").replace(".", "_")
            if "sepal_length" in cleaned or "sepallength" in cleaned:
                col_map[col] = "sepal_length"
            elif "sepal_width" in cleaned or "sepalwidth" in cleaned:
                col_map[col] = "sepal_width"
            elif "petal_length" in cleaned or "petallength" in cleaned:
                col_map[col] = "petal_length"
            elif "petal_width" in cleaned or "petalwidth" in cleaned:
                col_map[col] = "petal_width"
            elif "species" in cleaned or "target" in cleaned or "class" in cleaned:
                col_map[col] = "target"
        
        df_standard = raw_df.rename(columns=col_map)
        X = df_standard[FEATURE_NAMES].copy().astype(float)
        
        # Check target encoding
        if "target" in df_standard.columns:
            target_col = df_standard["target"]
            if target_col.dtype == object or isinstance(target_col.iloc[0], str):
                name_to_idx = {name: idx for idx, name in enumerate(TARGET_NAMES)}
                y = target_col.map(lambda val: name_to_idx.get(str(val).lower().replace("iris-", ""), 0))
            else:
                y = target_col.astype(int)
        else:
            raise ValueError("CSV data missing target/species column.")
        
        return X, y, FEATURE_NAMES, TARGET_NAMES

    # Default to scikit-learn's official bundled dataset
    raw = load_iris(as_frame=True)
    df = raw.frame.copy()
    
    # Standardize column names to snake_case without unit suffixes in DataFrame
    column_mapping = {
        "sepal length (cm)": "sepal_length",
        "sepal width (cm)": "sepal_width",
        "petal length (cm)": "petal_length",
        "petal width (cm)": "petal_width",
    }
    df = df.rename(columns=column_mapping)
    
    X = df[FEATURE_NAMES].copy().astype(float)
    y = df["target"].copy().astype(int)
    
    return X, y, FEATURE_NAMES, list(raw.target_names)


def save_raw_data_csv(output_path: Path | str = RAW_DATA_PATH) -> Path:
    """Exports the canonical Iris dataset to CSV format for inspection.

    Args:
        output_path: Target path for the CSV file.

    Returns:
        Path to the saved CSV file.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    
    X, y, _, target_names = load_iris_data()
    df = X.copy()
    df["target"] = y
    df["species"] = y.map(lambda i: target_names[i])
    df.to_csv(path, index=False)
    return path


def get_dataset_summary(X: pd.DataFrame, y: pd.Series, target_names: List[str]) -> Dict:
    """Computes comprehensive descriptive statistics and integrity diagnostics.

    Args:
        X: Feature DataFrame.
        y: Target Series.
        target_names: Target class label names.

    Returns:
        Dictionary containing shape, null counts, duplicate counts,
        class distribution, and five-number summary statistics.
    """
    full_df = X.copy()
    full_df["species"] = y.map(lambda i: target_names[i])
    
    missing_count = int(full_df.isna().sum().sum())
    duplicate_rows = int(full_df[FEATURE_NAMES].duplicated().sum())
    
    class_counts = {target_names[i]: int((y == i).sum()) for i in range(len(target_names))}
    
    stats_df = X.describe().to_dict()
    
    return {
        "num_samples": int(len(full_df)),
        "num_features": int(len(FEATURE_NAMES)),
        "features": FEATURE_NAMES,
        "classes": target_names,
        "class_distribution": class_counts,
        "missing_values_total": missing_count,
        "duplicate_rows_in_features": duplicate_rows,
        "descriptive_statistics": stats_df,
    }


if __name__ == "__main__":
    X, y, features, targets = load_iris_data()
    saved = save_raw_data_csv()
    summary = get_dataset_summary(X, y, targets)
    print(f"Iris dataset successfully loaded and exported to {saved}")
    print(f"Dataset shape: {X.shape}")
    print(f"Class distribution: {summary['class_distribution']}")
    print(f"Missing values: {summary['missing_values_total']}")
    print(f"Duplicate feature rows: {summary['duplicate_rows_in_features']}")
