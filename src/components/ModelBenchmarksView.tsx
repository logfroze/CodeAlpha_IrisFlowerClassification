import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

export const ModelBenchmarksView: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('Logistic Regression');

  const modelsData = {
    'Baseline (Stratified Dummy)': {
      cvAcc: 0.325,
      cvStd: 0.031,
      testAcc: 0.500,
      testPrecMacro: 0.490,
      testRecallMacro: 0.500,
      testF1Macro: 0.489,
      cm: [
        [5, 4, 1],
        [2, 3, 5],
        [2, 1, 7],
      ],
    },
    'Logistic Regression': {
      cvAcc: 0.958,
      cvStd: 0.026,
      testAcc: 0.933,
      testPrecMacro: 0.933,
      testRecallMacro: 0.933,
      testF1Macro: 0.933,
      cm: [
        [10, 0, 0],
        [0, 9, 1],
        [0, 1, 9],
      ],
    },
    'Random Forest': {
      cvAcc: 0.950,
      cvStd: 0.031,
      testAcc: 0.967,
      testPrecMacro: 0.970,
      testRecallMacro: 0.967,
      testF1Macro: 0.967,
      cm: [
        [10, 0, 0],
        [0, 9, 1],
        [0, 0, 10],
      ],
    },
    'K-Nearest Neighbors': {
      cvAcc: 0.958,
      cvStd: 0.026,
      testAcc: 0.933,
      testPrecMacro: 0.944,
      testRecallMacro: 0.933,
      testF1Macro: 0.933,
      cm: [
        [10, 0, 0],
        [0, 10, 0],
        [0, 2, 8],
      ],
    },
  };

  const activeModel = modelsData[selectedModel as keyof typeof modelsData];
  const classes = ['setosa', 'versicolor', 'virginica'];

  return (
    <div className="space-y-6">
      {/* Models Comparison Table in 3D Neumorphic Panel */}
      <div className="neu-flat rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            Model Benchmarks (Held-Out Test Set N=30)
          </h2>
          <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-lg">
            Champion: Logistic Regression
          </span>
        </div>

        <div className="overflow-x-auto neu-inset rounded-xl p-1">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-600 font-bold border-b border-slate-300/60">
              <tr>
                <th className="py-3 px-4">Pipeline</th>
                <th className="py-3 px-4">5-Fold CV</th>
                <th className="py-3 px-4">Test Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4 text-right">Select</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {Object.entries(modelsData).map(([name, data]) => {
                const isSelected = selectedModel === name;
                return (
                  <tr
                    key={name}
                    onClick={() => setSelectedModel(name)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-500/10 font-bold text-blue-900'
                        : 'hover:bg-slate-200/40 text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold">{name}</td>
                    <td className="py-3 px-4 font-mono">
                      {(data.cvAcc * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md ${
                          data.testAcc >= 0.95
                            ? 'bg-emerald-500 text-white shadow-xs'
                            : data.testAcc >= 0.9
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-300 text-slate-800'
                        }`}
                      >
                        {(data.testAcc * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{data.testPrecMacro.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono">{data.testRecallMacro.toFixed(3)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{data.testF1Macro.toFixed(3)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        className={`px-3 py-1 text-xs rounded-lg cursor-pointer ${
                          isSelected ? 'neu-pill-blue text-white font-bold' : 'neu-btn text-slate-700'
                        }`}
                      >
                        {isSelected ? 'Active' : 'View'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive 3D Confusion Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 neu-flat rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">
                Confusion Matrix
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Model: <strong>{selectedModel}</strong>
              </p>
            </div>

            {/* Tactile buttons to switch models */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl neu-inset">
              {Object.keys(modelsData).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedModel(m)}
                  className={`text-xs px-2.5 py-1 rounded-lg cursor-pointer transition-all ${
                    selectedModel === m
                      ? 'neu-btn-pressed text-blue-700 font-bold'
                      : 'neu-btn text-slate-600'
                  }`}
                >
                  {m.replace(' (Stratified Dummy)', '').replace(' Regression', '')}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Matrix Heatmap */}
          <div className="pt-2 max-w-md mx-auto">
            <div className="text-center text-[10px] font-black uppercase text-slate-500 mb-1">
              Predicted Species →
            </div>
            <div className="flex items-center">
              <div className="text-[10px] font-black uppercase text-slate-500 -rotate-90 pr-1">
                Actual →
              </div>
              <div className="flex-1 neu-inset p-3 rounded-2xl">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="p-1"></th>
                      {classes.map((c) => (
                        <th key={c} className="p-1 text-center font-bold text-slate-600 capitalize text-[11px]">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeModel.cm.map((row, rowIdx) => {
                      const actualClass = classes[rowIdx];
                      return (
                        <tr key={actualClass}>
                          <th className="p-1 text-right font-bold text-slate-600 capitalize text-[11px] pr-2">
                            {actualClass}
                          </th>
                          {row.map((val, colIdx) => {
                            const isDiagonal = rowIdx === colIdx;
                            let styleClass = 'neu-inset text-slate-400 font-medium';
                            if (isDiagonal && val > 0) {
                              styleClass = 'neu-pill-blue text-white font-black shadow-md';
                            } else if (!isDiagonal && val > 0) {
                              styleClass = 'bg-rose-500 text-white font-black shadow-md';
                            }

                            return (
                              <td key={colIdx} className="p-1">
                                <div
                                  className={`h-12 rounded-xl flex items-center justify-center text-sm transition-all ${styleClass}`}
                                >
                                  {val}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="md:col-span-4 space-y-4">
          <div className="neu-flat rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Evaluation Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="neu-inset p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Accuracy</div>
                <div className="text-lg font-black text-blue-700 mt-0.5">
                  {(activeModel.testAcc * 100).toFixed(1)}%
                </div>
              </div>
              <div className="neu-inset p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">F1-Score</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {activeModel.testF1Macro.toFixed(3)}
                </div>
              </div>
              <div className="neu-inset p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Precision</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {activeModel.testPrecMacro.toFixed(3)}
                </div>
              </div>
              <div className="neu-inset p-3 rounded-xl">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Recall</div>
                <div className="text-lg font-black text-slate-800 mt-0.5">
                  {activeModel.testRecallMacro.toFixed(3)}
                </div>
              </div>
            </div>
          </div>

          <div className="neu-flat rounded-2xl p-5 text-xs text-slate-600 font-medium space-y-2">
            <div className="font-bold text-slate-800">Model Selection:</div>
            <div>
              <strong>Logistic Regression</strong> is chosen for deployment because it yields high test accuracy (93.3%) with optimal probability calibration and low variance across CV folds.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
