import React, { useState, useMemo } from 'react';
import {
  FlowerInput,
  predictFlowerSpecies,
  FEATURE_BOUNDS,
} from '../utils/classifier';
import { PRESET_SPECIMENS } from '../data/irisData';
import { FlowerMorphologyVisualizer } from './FlowerMorphologyVisualizer';
import { AlertCircle } from 'lucide-react';

export const PredictorView: React.FC = () => {
  const [inputs, setInputs] = useState<FlowerInput>({
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
  });

  const [activePreset, setActivePreset] = useState<string>('Typical Setosa');

  // Compute prediction
  const { result, error } = useMemo(() => {
    try {
      const pred = predictFlowerSpecies(inputs);
      return { result: pred, error: null };
    } catch (err: any) {
      return { result: null, error: err.message || 'Validation error' };
    }
  }, [inputs]);

  const handleInputChange = (field: keyof FlowerInput, val: number) => {
    setActivePreset('Custom');
    setInputs((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const loadPreset = (preset: typeof PRESET_SPECIMENS[0]) => {
    setActivePreset(preset.name);
    setInputs({
      sepal_length: preset.values[0],
      sepal_width: preset.values[1],
      petal_length: preset.values[2],
      petal_width: preset.values[3],
    });
  };

  // Color schemes for active species
  const speciesStyles = {
    setosa: {
      gradient: 'from-blue-500 to-indigo-600',
      pillClass: 'neu-pill-blue',
      textColor: 'text-blue-700',
      barColor: 'bg-blue-600',
    },
    versicolor: {
      gradient: 'from-emerald-500 to-teal-700',
      pillClass: 'neu-pill-green',
      textColor: 'text-emerald-700',
      barColor: 'bg-emerald-600',
    },
    virginica: {
      gradient: 'from-amber-500 to-orange-600',
      pillClass: 'neu-pill-amber',
      textColor: 'text-amber-700',
      barColor: 'bg-amber-600',
    },
  }[result?.species || 'setosa'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Inputs & 3D Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Specimen Presets */}
          <div className="neu-flat rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase">
                Specimen Presets
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {activePreset}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESET_SPECIMENS.map((preset) => {
                const isSelected = activePreset === preset.name;
                const pillColor =
                  preset.species === 'setosa'
                    ? 'neu-pill-blue'
                    : preset.species === 'versicolor'
                    ? 'neu-pill-green'
                    : 'neu-pill-amber';

                return (
                  <button
                    key={preset.name}
                    onClick={() => loadPreset(preset)}
                    className={`p-3 rounded-xl text-left cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? `${pillColor} text-white font-bold transform translate-y-0.5`
                        : 'neu-btn text-slate-700 font-semibold'
                    }`}
                  >
                    <div className="text-xs">{preset.name}</div>
                    <div className="text-[10px] opacity-80 font-mono mt-0.5">
                      [{preset.values.join(', ')}] cm
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Morphological Sliders */}
          <div className="neu-flat rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase">
              Flower Dimensions
            </h2>

            {/* Sepal Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="sepal-length-input">Sepal Length</label>
                <div className="flex items-center gap-1.5 neu-inset px-2.5 py-1 rounded-lg">
                  <input
                    id="sepal-length-input"
                    type="number"
                    step="0.1"
                    min={FEATURE_BOUNDS.sepal_length.min}
                    max={FEATURE_BOUNDS.sepal_length.max}
                    value={inputs.sepal_length}
                    onChange={(e) =>
                      handleInputChange('sepal_length', parseFloat(e.target.value) || 0)
                    }
                    className="w-14 text-right font-mono text-xs font-bold bg-transparent outline-none text-slate-800"
                  />
                  <span className="text-slate-400 font-medium">cm</span>
                </div>
              </div>
              <input
                id="sepal-length-slider"
                aria-label="Sepal Length"
                type="range"
                min="3.0"
                max="8.5"
                step="0.1"
                value={inputs.sepal_length}
                onChange={(e) =>
                  handleInputChange('sepal_length', parseFloat(e.target.value))
                }
                className="w-full neu-slider"
              />
            </div>

            {/* Sepal Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="sepal-width-input">Sepal Width</label>
                <div className="flex items-center gap-1.5 neu-inset px-2.5 py-1 rounded-lg">
                  <input
                    id="sepal-width-input"
                    type="number"
                    step="0.1"
                    min={FEATURE_BOUNDS.sepal_width.min}
                    max={FEATURE_BOUNDS.sepal_width.max}
                    value={inputs.sepal_width}
                    onChange={(e) =>
                      handleInputChange('sepal_width', parseFloat(e.target.value) || 0)
                    }
                    className="w-14 text-right font-mono text-xs font-bold bg-transparent outline-none text-slate-800"
                  />
                  <span className="text-slate-400 font-medium">cm</span>
                </div>
              </div>
              <input
                id="sepal-width-slider"
                aria-label="Sepal Width"
                type="range"
                min="1.8"
                max="4.6"
                step="0.1"
                value={inputs.sepal_width}
                onChange={(e) =>
                  handleInputChange('sepal_width', parseFloat(e.target.value))
                }
                className="w-full neu-slider"
              />
            </div>

            {/* Petal Length */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="petal-length-input">Petal Length</label>
                <div className="flex items-center gap-1.5 neu-inset px-2.5 py-1 rounded-lg">
                  <input
                    id="petal-length-input"
                    type="number"
                    step="0.1"
                    min={FEATURE_BOUNDS.petal_length.min}
                    max={FEATURE_BOUNDS.petal_length.max}
                    value={inputs.petal_length}
                    onChange={(e) =>
                      handleInputChange('petal_length', parseFloat(e.target.value) || 0)
                    }
                    className="w-14 text-right font-mono text-xs font-bold bg-transparent outline-none text-slate-800"
                  />
                  <span className="text-slate-400 font-medium">cm</span>
                </div>
              </div>
              <input
                id="petal-length-slider"
                aria-label="Petal Length"
                type="range"
                min="1.0"
                max="7.0"
                step="0.1"
                value={inputs.petal_length}
                onChange={(e) =>
                  handleInputChange('petal_length', parseFloat(e.target.value))
                }
                className="w-full neu-slider"
              />
            </div>

            {/* Petal Width */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="petal-width-input">Petal Width</label>
                <div className="flex items-center gap-1.5 neu-inset px-2.5 py-1 rounded-lg">
                  <input
                    id="petal-width-input"
                    type="number"
                    step="0.1"
                    min={FEATURE_BOUNDS.petal_width.min}
                    max={FEATURE_BOUNDS.petal_width.max}
                    value={inputs.petal_width}
                    onChange={(e) =>
                      handleInputChange('petal_width', parseFloat(e.target.value) || 0)
                    }
                    className="w-14 text-right font-mono text-xs font-bold bg-transparent outline-none text-slate-800"
                  />
                  <span className="text-slate-400 font-medium">cm</span>
                </div>
              </div>
              <input
                id="petal-width-slider"
                aria-label="Petal Width"
                type="range"
                min="0.1"
                max="2.8"
                step="0.1"
                value={inputs.petal_width}
                onChange={(e) =>
                  handleInputChange('petal_width', parseFloat(e.target.value))
                }
                className="w-full neu-slider"
              />
            </div>
          </div>
        </div>

        {/* Right Column: 3D Botanical Visualizer & Prediction Panel */}
        <div className="lg:col-span-6 space-y-6">
          {error ? (
            <div className="neu-flat rounded-2xl p-6 text-rose-700 neu-inset">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Invalid Measurement
              </div>
              <p className="text-xs mt-1 font-medium">{error}</p>
            </div>
          ) : result ? (
            <div className="neu-flat rounded-2xl p-6 space-y-6">
              {/* Dynamic 3D Flower Visualizer */}
              <div className="flex justify-center">
                <FlowerMorphologyVisualizer inputs={inputs} species={result.species} />
              </div>

              {/* 3D Elevated Result Banner */}
              <div className="neu-inset rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                    Predicted Species
                  </div>
                  <h3 className={`text-2xl font-black italic tracking-tight ${speciesStyles.textColor}`}>
                    {result.displayName}
                  </h3>
                </div>
                <div className={`px-4 py-2 rounded-xl text-white font-black text-sm ${speciesStyles.pillClass}`}>
                  {result.confidence}% Match
                </div>
              </div>

              {/* Class Probability Gauges */}
              <div className="space-y-3 pt-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Class Probabilities
                </div>

                {/* Setosa */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      Iris setosa
                    </span>
                    <span className="font-mono">{(result.probabilities.setosa * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${result.probabilities.setosa * 100}%` }}
                    />
                  </div>
                </div>

                {/* Versicolor */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                      Iris versicolor
                    </span>
                    <span className="font-mono">{(result.probabilities.versicolor * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${result.probabilities.versicolor * 100}%` }}
                    />
                  </div>
                </div>

                {/* Virginica */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                      Iris virginica
                    </span>
                    <span className="font-mono">{(result.probabilities.virginica * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${result.probabilities.virginica * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
