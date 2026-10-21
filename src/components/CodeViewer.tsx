import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode } from 'lucide-react';

export const CodeViewer: React.FC = () => {
  const [activeFile, setActiveFile] = useState<string>('train.py');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const cliCommands = [
    {
      id: 'train',
      title: 'Train Pipelines & 5-Fold CV',
      cmd: 'python3 -m src.train',
    },
    {
      id: 'test',
      title: 'Run Pytest Suite',
      cmd: 'pytest tests/ -v',
    },
    {
      id: 'predict',
      title: 'Predict Sample via CLI',
      cmd: 'python3 -m src.predict --sepal-length 5.1 --sepal-width 3.5 --petal-length 1.4 --petal-width 0.2',
    },
    {
      id: 'streamlit',
      title: 'Launch Streamlit App',
      cmd: 'streamlit run streamlit_app.py',
    },
  ];

  const codeSnippets: Record<string, string> = {
    'train.py': `from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
import joblib

# Stratified split to prevent data leakage
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Pipeline: Scaler fitted only on train folds
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", LogisticRegression(max_iter=300, random_state=42))
])

pipeline.fit(X_train, y_train)
joblib.dump(artifact, "models/iris_classifier.joblib")`,
    'predict.py': `import joblib
import pandas as pd

def predict_species(sepal_length, sepal_width, petal_length, petal_width):
    artifact = joblib.load("models/iris_classifier.joblib")
    df = pd.DataFrame([{"sepal_length": sepal_length, "sepal_width": sepal_width,
                        "petal_length": petal_length, "petal_width": petal_width}])
    pred_idx = artifact["pipeline"].predict(df)[0]
    probs = artifact["pipeline"].predict_proba(df)[0]
    return {
        "species": artifact["target_names"][pred_idx],
        "probabilities": dict(zip(artifact["target_names"], probs))
    }`,
    'test_predict.py': `import pytest
from src.predict import validate_input, predict_species

def test_validate_input_negative():
    with pytest.raises(ValueError, match="strictly positive"):
        validate_input(-5.0, 3.0, 1.4, 0.2)

def test_predict_species_setosa():
    res = predict_species(5.0, 3.4, 1.5, 0.2)
    assert res["species"] == "setosa"
    assert res["probabilities"]["setosa"] > 0.8`,
  };

  return (
    <div className="space-y-6">
      {/* 3D CLI Commands */}
      <div className="neu-flat rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
          <Terminal className="w-4 h-4 text-blue-600" />
          Terminal Commands
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {cliCommands.map((item) => (
            <div key={item.id} className="neu-inset rounded-xl p-3 text-xs space-y-1.5">
              <div className="font-bold text-slate-700">{item.title}</div>
              <div className="flex items-center justify-between bg-slate-900 text-slate-200 font-mono text-[11px] px-3 py-2 rounded-lg shadow-inner">
                <span className="truncate mr-2">{item.cmd}</span>
                <button
                  onClick={() => copyToClipboard(item.cmd, item.id)}
                  className="text-slate-400 hover:text-white cursor-pointer shrink-0"
                  title="Copy command"
                >
                  {copiedCmd === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Code Inspector */}
      <div className="neu-flat rounded-2xl overflow-hidden p-2 space-y-2">
        <div className="flex items-center gap-2 p-1.5 neu-inset rounded-xl overflow-x-auto no-scrollbar">
          {Object.keys(codeSnippets).map((filename) => {
            const isSelected = activeFile === filename;
            return (
              <button
                key={filename}
                onClick={() => setActiveFile(filename)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'neu-btn-pressed text-blue-700'
                    : 'neu-btn text-slate-600'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                {filename}
              </button>
            );
          })}
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed neu-inset">
          <pre>{codeSnippets[activeFile]}</pre>
        </div>
      </div>
    </div>
  );
};
