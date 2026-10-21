"""Streamlit interactive web demo for CodeAlpha Iris Flower Classification.

Loads the fitted Scikit-learn pipeline, validates inputs, and visualizes
real-time species classification with class probability distribution.
"""

from pathlib import Path
import streamlit as st
import pandas as pd
import json

from src.predict import predict_species, FEATURE_BOUNDS, DEFAULT_MODEL_PATH
from src.data_loader import TARGET_NAMES

st.set_page_config(
    page_title="Iris Flower Classifier | CodeAlpha",
    page_icon="🌸",
    layout="wide",
)

# Custom styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #64748b;
        margin-bottom: 1.5rem;
    }
    .prediction-box {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 1.25rem;
        margin-top: 1rem;
    }
</style>
""", unsafe_allow_html=True)

st.markdown('<div class="main-title">🌸 Iris Flower Species Classifier</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-title">CodeAlpha Data Science Internship Project • Supervised Machine Learning Pipeline</div>', unsafe_allow_html=True)

# Check if model exists
if not DEFAULT_MODEL_PATH.exists():
    st.error(
        f"⚠️ Trained model artifact not found at `{DEFAULT_MODEL_PATH}`.\n\n"
        "Please run model training first:\n```bash\npython -m src.train\n```"
    )
    st.stop()

# Layout columns: Sidebar / Presets and Main Inputs
col_left, col_right = st.columns([1, 1.2], gap="large")

with col_left:
    st.subheader("1. Input Measurements")
    st.caption("Provide flower sepals and petals measurements in centimeters (cm).")
    
    # Presets selector
    preset_choice = st.selectbox(
        "Load Example Sample:",
        [
            "Custom Input",
            "Example Iris Setosa (sl=5.1, sw=3.5, pl=1.4, pw=0.2)",
            "Example Iris Versicolor (sl=5.9, sw=3.0, pl=4.2, pw=1.5)",
            "Example Iris Virginica (sl=6.5, sw=3.0, pl=5.5, pw=1.8)",
        ],
    )
    
    preset_values = {
        "Custom Input": (5.8, 3.0, 4.3, 1.3),
        "Example Iris Setosa (sl=5.1, sw=3.5, pl=1.4, pw=0.2)": (5.1, 3.5, 1.4, 0.2),
        "Example Iris Versicolor (sl=5.9, sw=3.0, pl=4.2, pw=1.5)": (5.9, 3.0, 4.2, 1.5),
        "Example Iris Virginica (sl=6.5, sw=3.0, pl=5.5, pw=1.8)": (6.5, 3.0, 5.5, 1.8),
    }
    
    default_sl, default_sw, default_pl, default_pw = preset_values[preset_choice]
    
    c1, c2 = st.columns(2)
    with c1:
        sepal_length = st.number_input(
            "Sepal Length (cm)",
            min_value=FEATURE_BOUNDS["sepal_length"][0],
            max_value=FEATURE_BOUNDS["sepal_length"][1],
            value=default_sl,
            step=0.1,
            format="%.1f",
            help="Length of the sepal in centimeters."
        )
        petal_length = st.number_input(
            "Petal Length (cm)",
            min_value=FEATURE_BOUNDS["petal_length"][0],
            max_value=FEATURE_BOUNDS["petal_length"][1],
            value=default_pl,
            step=0.1,
            format="%.1f",
            help="Length of the petal in centimeters."
        )
    with c2:
        sepal_width = st.number_input(
            "Sepal Width (cm)",
            min_value=FEATURE_BOUNDS["sepal_width"][0],
            max_value=FEATURE_BOUNDS["sepal_width"][1],
            value=default_sw,
            step=0.1,
            format="%.1f",
            help="Width of the sepal in centimeters."
        )
        petal_width = st.number_input(
            "Petal Width (cm)",
            min_value=FEATURE_BOUNDS["petal_width"][0],
            max_value=FEATURE_BOUNDS["petal_width"][1],
            value=default_pw,
            step=0.1,
            format="%.1f",
            help="Width of the petal in centimeters."
        )

with col_right:
    st.subheader("2. Model Prediction & Probabilities")
    
    try:
        prediction_result = predict_species(
            sepal_length=sepal_length,
            sepal_width=sepal_width,
            petal_length=petal_length,
            petal_width=petal_width,
        )
        
        predicted_sp = prediction_result["species"].capitalize()
        model_name = prediction_result["model_used"]
        probs = prediction_result["probabilities"]
        
        # Color badge depending on species
        species_colors = {
            "setosa": "#2563eb",
            "versicolor": "#059669",
            "virginica": "#d97706",
        }
        color = species_colors.get(prediction_result["species"], "#3b82f6")
        
        st.markdown(
            f"""
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 6px solid {color}; margin-bottom: 20px;">
                <span style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; font-weight: 600;">Predicted Species</span>
                <h2 style="margin: 4px 0 0 0; color: #0f172a;">Iris {predicted_sp}</h2>
                <div style="font-size: 0.88rem; color: #475569; margin-top: 4px;">Classifier: <strong>{model_name}</strong></div>
            </div>
            """,
            unsafe_allow_html=True,
        )
        
        st.markdown("#### Class Probability Distribution")
        prob_df = pd.DataFrame([
            {"Species": sp.capitalize(), "Probability (%)": round(val * 100, 2), "Raw": val}
            for sp, val in probs.items()
        ])
        
        for _, row in prob_df.iterrows():
            sp_name = row["Species"]
            pct = row["Probability (%)"]
            st.write(f"**Iris {sp_name}**: `{pct:.1f}%`")
            st.progress(row["Raw"])
            
    except Exception as exc:
        st.error(f"Prediction Error: {exc}")

# Bottom Section: Metadata & Metrics Tab
st.divider()
tab1, tab2 = st.tabs(["📊 Model Performance Benchmarks", "ℹ️ Dataset Information"])

with tab1:
    metrics_file = Path(__file__).resolve().parent / "outputs" / "metrics_summary.json"
    if metrics_file.exists():
        with open(metrics_file, "r") as f:
            summary_data = json.load(f)
        
        st.write("Held-out test set performance (30 samples, 10 per class stratified):")
        
        table_rows = []
        for name, m in summary_data.get("models", {}).items():
            table_rows.append({
                "Model": name,
                "5-Fold CV Accuracy": f"{m.get('cv_accuracy_mean', 0):.1%} (±{m.get('cv_accuracy_std', 0):.1%})",
                "Test Accuracy": f"{m.get('test_accuracy', 0):.1%}",
                "Test F1 (Macro)": f"{m.get('test_f1_macro', 0):.3f}",
                "Test F1 (Weighted)": f"{m.get('test_f1_weighted', 0):.3f}",
            })
        st.dataframe(pd.DataFrame(table_rows), use_container_width=True)
    else:
        st.info("Run `python -m src.train` to generate benchmark comparison logs.")

with tab2:
    st.markdown("""
    **Dataset**: Iris Plants Database (Fisher, 1936).  
    **Total Instances**: 150 (50 Setosa, 50 Versicolor, 50 Virginica).  
    **Features**:
    - Sepal Length in cm
    - Sepal Width in cm
    - Petal Length in cm
    - Petal Width in cm  
    **Units**: Centimeters (cm).  
    **Target**: Three flower varieties of the genus Iris.
    """)
