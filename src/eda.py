"""Exploratory Data Analysis (EDA) module for Iris Flower Classification.

Generates professional, publication-quality visualizations:
1. Species distribution bar chart.
2. Multi-feature pairplot with KDE density estimates.
3. Pearson correlation heatmap with annotations.
4. Multi-panel boxplots showing feature distributions across species.
"""

from pathlib import Path
from typing import Optional
import matplotlib.pyplot as plt
import pandas as pd
import seaborn as sns

from src.data_loader import FEATURE_NAMES, load_iris_data

OUTPUT_FIGURES_DIR = Path(__file__).resolve().parent.parent / "outputs" / "figures"

# Clean styling configuration for publication-ready visual aesthetics
PALETTE = {
    "setosa": "#2563eb",      # Royal Blue
    "versicolor": "#059669",  # Emerald Green
    "virginica": "#d97706",   # Amber / Gold
}

plt.rcParams["font.sans-serif"] = "DejaVu Sans"
plt.rcParams["axes.edgecolor"] = "#cbd5e1"
plt.rcParams["axes.linewidth"] = 0.8


def generate_eda_visualizations(output_dir: Optional[Path | str] = None) -> list[Path]:
    """Generates all exploratory charts and saves them to the output figures directory.

    Args:
        output_dir: Directory where PNG figures will be stored.

    Returns:
        List of generated file paths.
    """
    out_path = Path(output_dir) if output_dir else OUTPUT_FIGURES_DIR
    out_path.mkdir(parents=True, exist_ok=True)
    
    X, y, _, target_names = load_iris_data()
    df = X.copy()
    df["species"] = y.map(lambda i: target_names[i])
    
    generated_files: list[Path] = []
    
    # 1. Species Distribution Bar Chart
    plt.figure(figsize=(7, 4.5), dpi=150)
    ax = sns.countplot(
        data=df,
        x="species",
        hue="species",
        legend=False,
        palette=PALETTE,
        edgecolor="#1e293b",
        linewidth=0.6,
    )
    plt.title("Iris Species Distribution (N = 150)", fontsize=13, weight="bold", pad=12)
    plt.xlabel("Iris Species", fontsize=11, labelpad=8)
    plt.ylabel("Sample Count", fontsize=11, labelpad=8)
    plt.ylim(0, 60)
    plt.grid(axis="y", linestyle="--", alpha=0.4)
    
    # Add count labels on top of bars
    for p in ax.patches:
        height = p.get_height()
        ax.annotate(
            f"{int(height)} (33.3%)",
            (p.get_x() + p.get_width() / 2.0, height),
            ha="center",
            va="bottom",
            xytext=(0, 4),
            textcoords="offset points",
            fontsize=10,
            weight="medium",
        )
    
    plt.tight_layout()
    p1 = out_path / "01_species_distribution.png"
    plt.savefig(p1, bbox_inches="tight")
    plt.close()
    generated_files.append(p1)
    
    # 2. Multi-feature Pairplot with KDE diagonal
    pairplot_df = df.rename(columns={
        "sepal_length": "Sepal Length (cm)",
        "sepal_width": "Sepal Width (cm)",
        "petal_length": "Petal Length (cm)",
        "petal_width": "Petal Width (cm)",
    })
    g = sns.pairplot(
        pairplot_df,
        hue="species",
        palette=PALETTE,
        diag_kind="kde",
        plot_kws={"alpha": 0.8, "s": 35, "edgecolor": "none"},
        diag_kws={"fill": True, "alpha": 0.45},
    )
    g.figure.subplots_adjust(top=0.94)
    g.figure.suptitle("Pairwise Feature Relationships & Density by Species", fontsize=14, weight="bold")
    p2 = out_path / "02_feature_pairplot.png"
    g.savefig(p2, dpi=150, bbox_inches="tight")
    plt.close()
    generated_files.append(p2)
    
    # 3. Pearson Correlation Heatmap
    corr_df = df[FEATURE_NAMES].rename(columns={
        "sepal_length": "Sepal Length",
        "sepal_width": "Sepal Width",
        "petal_length": "Petal Length",
        "petal_width": "Petal Width",
    })
    plt.figure(figsize=(6.5, 5.2), dpi=150)
    sns.heatmap(
        corr_df.corr(),
        annot=True,
        fmt=".2f",
        cmap="coolwarm",
        vmin=-1,
        vmax=1,
        center=0,
        square=True,
        linewidths=0.75,
        cbar_kws={"label": "Pearson Correlation (r)", "shrink": 0.8},
        annot_kws={"size": 11, "weight": "bold"},
    )
    plt.title("Pearson Correlation Heatmap (Iris Features)", fontsize=13, weight="bold", pad=12)
    plt.tight_layout()
    p3 = out_path / "03_correlation_heatmap.png"
    plt.savefig(p3, bbox_inches="tight")
    plt.close()
    generated_files.append(p3)
    
    # 4. Multi-panel Feature Boxplots
    fig, axes = plt.subplots(2, 2, figsize=(10, 8), dpi=150)
    feature_labels = {
        "sepal_length": "Sepal Length (cm)",
        "sepal_width": "Sepal Width (cm)",
        "petal_length": "Petal Length (cm)",
        "petal_width": "Petal Width (cm)",
    }
    
    for ax, feat in zip(axes.flatten(), FEATURE_NAMES):
        sns.boxplot(
            data=df,
            x="species",
            y=feat,
            hue="species",
            legend=False,
            palette=PALETTE,
            ax=ax,
            width=0.45,
            linewidth=1.2,
            fliersize=3.5,
        )
        ax.set_title(feature_labels[feat], fontsize=11, weight="bold")
        ax.set_xlabel("")
        ax.set_ylabel("Centimeters (cm)", fontsize=9)
        ax.grid(axis="y", linestyle="--", alpha=0.35)
    
    fig.suptitle("Feature Distribution and Spread by Iris Species", fontsize=14, weight="bold", y=0.98)
    plt.tight_layout()
    p4 = out_path / "04_feature_boxplots.png"
    plt.savefig(p4, bbox_inches="tight")
    plt.close()
    generated_files.append(p4)
    
    return generated_files


if __name__ == "__main__":
    files = generate_eda_visualizations()
    print("EDA Visualizations created:")
    for f in files:
        print(f" - {f}")
