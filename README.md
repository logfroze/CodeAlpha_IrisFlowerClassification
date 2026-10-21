# CodeAlpha Data Science Internship: Iris Flower Classification

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.4%2B-orange.svg)](https://scikit-learn.org/)
[![Tests](https://img.shields.io/badge/tests-pytest-green.svg)](https://pytest.org/)
[![Internship](https://img.shields.io/badge/CodeAlpha-Data%20Science%20Internship-purple.svg)](https://www.codealpha.tech/)

A production-quality, reproducible supervised machine learning project developed for the **CodeAlpha Data Science Internship**. This project builds, rigorously validates, and compares classification pipelines to predict iris species (*Iris setosa*, *Iris versicolor*, and *Iris virginica*) from morphometric sepal and petal measurements.

---

## 📌 Internship Task Context

- **Organization:** CodeAlpha
- **Domain:** Data Science & Machine Learning
- **Task ID:** Task 1 – Iris Flower Classification
- **Repository Name:** `CodeAlpha_IrisFlowerClassification`
- **Objective:** Train and evaluate supervised learning models on flower dimensions, prevent data leakage using modular pipelines, perform cross-validation, compare performance against an empirical baseline, document results with actual computed metrics, and provide a reusable, validated prediction interface.

---

## 🌸 Dataset and Morphometric Features

This project utilizes the canonical **Iris Plants Database** originally gathered by botanist Edgar Anderson on the Gaspé Peninsula (Quebec, Canada) and published by Ronald A. Fisher in 1936 (*The Use of Multiple Measurements in Taxonomic Problems*).

To eliminate fragile external network dependencies and guarantee 100% reproducibility across environments, the pipeline loads scikit-learn's built-in dataset via `sklearn.datasets.load_iris(as_frame=True)` and exports an exact CSV copy to `data/iris.csv` for inspection.

### Dataset Integrity & Summary
| Property | Value | Description |
| :--- | :--- | :--- |
| **Total Instances ($N$)** | `150` | 50 samples per class (perfectly balanced 1:1:1 ratio) |
| **Feature Columns ($d$)** | `4` | Continuous measurements in centimeters ($cm$) |
| **Target Classes** | `3` | `setosa` (0), `versicolor` (1), `virginica` (2) |
| **Missing / Null Values** | `0` | Clean dataset with zero missing entries |
| **Duplicate Feature Rows** | `1` | One biological duplicate: row 142 matches row 101 (`[5.8, 2.7, 5.1, 1.9]`) |

### Feature Descriptions and Units
1. `sepal_length` (**Sepal Length**): Outer flower petal leaf length in centimeters ($cm$). Mean: $5.84\text{ cm}$, Std: $0.83\text{ cm}$.
2. `sepal_width` (**Sepal Width**): Outer flower petal leaf width in centimeters ($cm$). Mean: $3.06\text{ cm}$, Std: $0.44\text{ cm}$.
3. `petal_length` (**Petal Length**): Inner fertile petal length in centimeters ($cm$). Mean: $3.76\text{ cm}$, Std: $1.77\text{ cm}$.
4. `petal_width` (**Petal Width**): Inner fertile petal width in centimeters ($cm$). Mean: $1.20\text{ cm}$, Std: $0.76\text{ cm}$.

---

## 🔬 Exploratory Data Analysis (EDA) Insights

Exploratory visual artifacts are saved under `outputs/figures/`:

1. **Species Distribution (`01_species_distribution.png`)**:
   Confirms an identical count of 50 samples ($33.3\%$) per species, eliminating class imbalance concerns.
2. **Feature Pairplot (`02_feature_pairplot.png`)**:
   - *Iris setosa* forms an isolated, linearly separable cluster along petal length and petal width dimensions ($< 2.0\text{ cm}$).
   - *Iris versicolor* and *Iris virginica* occupy adjacent regions with mild overlap in the $4.5\text{ cm} \le \text{petal length} \le 5.2\text{ cm}$ range, requiring non-linear or regularized multi-dimensional boundaries.
3. **Correlation Heatmap (`03_correlation_heatmap.png`)**:
   - `petal_length` and `petal_width` exhibit extreme collinearity ($r = 0.96$).
   - `sepal_length` strongly correlates with petal length ($r = 0.87$) and petal width ($r = 0.82$).
   - `sepal_width` displays a mild negative correlation with petal dimensions ($r \approx -0.37$ to $-0.43$).
4. **Feature Boxplots (`04_feature_boxplots.png`)**:
   Depicts median and interquartile ranges (IQR) across species, demonstrating clear separability in petal dimensions.

---

## 🏗️ Project Architecture

```
CodeAlpha_IrisFlowerClassification/
├── data/
│   └── iris.csv                                      # Exported canonical dataset
├── notebooks/
│   └── 01_iris_classification_eda_and_modeling.ipynb  # Interactive analysis & narrative
├── src/
│   ├── __init__.py
│   ├── data_loader.py                                # Data loader, CSV exporter & summary
│   ├── eda.py                                        # Publication-ready figure generator
│   ├── train.py                                      # Pipelines, CV, evaluation & serialization
│   └── predict.py                                    # Input validation & inference API
├── models/
│   └── iris_classifier.joblib                        # Fitted pipeline artifact + metadata
├── outputs/
│   ├── figures/
│   │   ├── 01_species_distribution.png
│   │   ├── 02_feature_pairplot.png
│   │   ├── 03_correlation_heatmap.png
│   │   ├── 04_feature_boxplots.png
│   │   └── 05_confusion_matrix_comparison.png
│   ├── metrics_summary.json                          # Actual computed evaluation metrics
│   └── test_predictions.csv                          # Out-of-sample predictions on test set
├── tests/
│   ├── __init__.py
│   ├── test_data_loader.py                           # Integrity & shape tests
│   ├── test_train.py                                 # Pipeline & evaluation tests
│   └── test_predict.py                               # Input validation & inference tests
├── streamlit_app.py                                  # Interactive UI demo
├── requirements.txt                                  # Pinned dependencies
├── README.md                                         # Comprehensive documentation
└── .gitignore                                        # Clean version control exclusions
```

---

## ⚙️ Methodology & Prevention of Data Leakage

1. **Stratified Split**:
   - Data is split into $80\%$ training ($N = 120$) and $20\%$ held-out testing ($N = 30$) with `stratify=y` and `random_state=42`.
   - Each partition strictly maintains equal representation: exactly 40 samples per class in training and 10 samples per class in test.
2. **Encapsulated Preprocessing**:
   - `StandardScaler` is fitted **strictly on training folds** inside Scikit-learn `Pipeline` instances (`Pipeline([('scaler', StandardScaler()), ('classifier', ...)])`).
   - Feature means and standard deviations are never calculated over the combined or test data, preventing informational leakage.
3. **Cross-Validation**:
   - 5-Fold Stratified Cross-Validation (`StratifiedKFold(n_splits=5, shuffle=True, random_state=42)`) is conducted exclusively on the 120 training samples.

---

## 📊 Actual Execution & Evaluation Metrics

The following metrics were **empirically computed** on the identical held-out test set ($N = 30$, 10 samples per species) using `random_state=42`:

### Benchmark Performance Comparison
| Model | 5-Fold CV Accuracy (Train) | Test Accuracy | Test Precision (Macro) | Test Recall (Macro) | Test F1-Score (Macro) | Test F1-Score (Weighted) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline (Stratified Dummy)** | $32.50\% \pm 3.12\%$ | $50.00\%$ | $0.490$ | $0.500$ | $0.489$ | $0.489$ |
| **Logistic Regression** | $\mathbf{95.83\% \pm 2.64\%}$ | $\mathbf{93.33\%}$ | $\mathbf{0.933}$ | $\mathbf{0.933}$ | $\mathbf{0.933}$ | $\mathbf{0.933}$ |
| **Random Forest ($100$ trees)** | $95.00\% \pm 3.12\%$ | $\mathbf{96.67\%}$ | $\mathbf{0.970}$ | $\mathbf{0.967}$ | $\mathbf{0.967}$ | $\mathbf{0.967}$ |
| **K-Nearest Neighbors ($k=5$)** | $\mathbf{95.83\% \pm 2.64\%}$ | $\mathbf{93.33\%}$ | $\mathbf{0.944}$ | $\mathbf{0.933}$ | $\mathbf{0.933}$ | $\mathbf{0.933}$ |

### Confusion Matrix on Held-Out Test Set ($N=30$)

#### Logistic Regression (Test Accuracy: $93.33\%$, $28/30$ Correct)
| True \ Predicted | Setosa | Versicolor | Virginica |
| :--- | :---: | :---: | :---: |
| **Setosa** | **10** | 0 | 0 |
| **Versicolor** | 0 | **9** | 1 |
| **Virginica** | 0 | 1 | **9** |

#### Random Forest (Test Accuracy: $96.67\%$, $29/30$ Correct)
| True \ Predicted | Setosa | Versicolor | Virginica |
| :--- | :---: | :---: | :---: |
| **Setosa** | **10** | 0 | 0 |
| **Versicolor** | 0 | **9** | 1 |
| **Virginica** | 0 | 0 | **10** |

### Per-Class Performance Summary (Logistic Regression)
- **Setosa**: Precision $1.000$, Recall $1.000$, F1-score $1.000$ ($10/10$ correct)
- **Versicolor**: Precision $0.900$, Recall $0.900$, F1-score $0.900$ ($9/10$ correct, 1 misclassified as Virginica)
- **Virginica**: Precision $0.900$, Recall $0.900$, F1-score $0.900$ ($9/10$ correct, 1 misclassified as Versicolor)

### Metric Definitions Explained
- **Accuracy**: $\frac{\text{Correct Predictions}}{\text{Total Predictions}}$. Represents overall correctness across all classes.
- **Precision**: $\frac{TP}{TP + FP}$. Measures reliability when predicting a given class (minimizing false alarms).
- **Recall (Sensitivity)**: $\frac{TP}{TP + FN}$. Measures ability to find all positive instances of a class.
- **F1-Score**: $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$. Harmonic mean balancing precision and recall.
- **Macro Average**: Computes metrics independently for each class and calculates the unweighted mean, treating all classes with equal importance.
- **Weighted Average**: Averages metrics weighted by the support (number of true instances) of each class.

---

## 🚀 Installation & Quick Start

### 1. Clone & Set Up Environment
```bash
# Clone the repository
git clone https://github.com/your-username/CodeAlpha_IrisFlowerClassification.git
cd CodeAlpha_IrisFlowerClassification

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Run the End-to-End ML Pipeline
```bash
# 1. Export dataset and compute summary
python3 -m src.data_loader

# 2. Generate exploratory visualizations
python3 -m src.eda

# 3. Train all models, run cross-validation, and serialize champion model
python3 -m src.train
```

### 3. Run the Unit Test Suite
```bash
pytest tests/ -v
```
All 16 unit tests validate data shapes, split stratification, pipeline leakage prevention, numeric input validation boundaries, and model inference.

### 4. Make Predictions via CLI
```bash
# Example: Predicting Iris Setosa
python3 -m src.predict --sepal-length 5.1 --sepal-width 3.5 --petal-length 1.4 --petal-width 0.2

# Example: Predicting Iris Virginica
python3 -m src.predict --sepal-length 6.7 --sepal-width 3.3 --petal-length 5.7 --petal-width 2.1
```

### 5. Launch the Streamlit Interactive Demo
```bash
streamlit run streamlit_app.py
```
Opens an interactive web interface with measurement sliders, sample presets, live predictions, and calibrated probability distributions.

---

## 🐍 Reusable Python API Example

```python
from src.predict import predict_species

# Predict with automatic botanical input validation
result = predict_species(
    sepal_length=5.1,
    sepal_width=3.5,
    petal_length=1.4,
    petal_width=0.2
)

print("Predicted Species:", result["species"])
print("Class Probabilities:", result["probabilities"])
# Output:
# Predicted Species: setosa
# Class Probabilities: {'setosa': 0.9808, 'versicolor': 0.0192, 'virginica': 0.0}
```

### Input Validation Error Handling
The `validate_input()` routine strictly guards against corrupt data:
```python
# Negative values raise ValueError
predict_species(sepal_length=-5.0, sepal_width=3.0, petal_length=1.4, petal_width=0.2)
# Raises: ValueError: Feature 'sepal_length' must be strictly positive (> 0 cm), got -5.0 cm.

# Non-numeric values raise TypeError
predict_species(sepal_length="abc", sepal_width=3.0, petal_length=1.4, petal_width=0.2)
# Raises: TypeError: Feature 'sepal_length' must be a valid numeric number...
```

---

## ⚠️ Limitations & Real-World Considerations

1. **Small Sample Size ($N = 150$)**:
   The Iris dataset is a classic educational benchmark containing only 150 instances from 1936. High test set accuracy ($>93\%$) is expected due to linear separability in *Iris setosa* and clean laboratory-like measurements.
2. **Limited Generalizability**:
   Real-world botanical taxonomy involves hundreds of iris species and natural morphological variation due to regional soil, climate, sun exposure, and hybridization.
3. **Collinear Features**:
   `petal_length` and `petal_width` exhibit high collinearity ($r = 0.96$). While tree-based ensembles handle collinearity seamlessly, linear models benefit from regularization ($L_2$ penalty).

---

## 🔮 Future Improvements

1. **Bayesian Hyperparameter Optimization**: Employ Optuna to tune regularization strengths ($C$) and tree depths.
2. **Advanced Ensembles**: Benchmark XGBoost and LightGBM alongside Stacking Classifiers.
3. **Deployment**: Package into a containerized REST API using FastAPI and Docker.

---

## 📜 License & Acknowledgments
- **Dataset**: Fisher, R. A. (1936). *The use of multiple measurements in taxonomic problems*. Annals of Eugenics.
- **Internship**: Conducted under the **CodeAlpha Data Science Internship Program**.
- **License**: MIT License.
