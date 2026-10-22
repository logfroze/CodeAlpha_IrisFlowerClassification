import React, { useState, useMemo, useEffect } from 'react';
import {
  FlowerInput,
  predictFlowerSpecies,
  FEATURE_BOUNDS,
  TARGET_SPECIES,
} from '../utils/classifier';
import { PRESET_SPECIMENS } from '../data/irisData';
import { FlowerMorphologyVisualizer } from './FlowerMorphologyVisualizer';
import { AlertCircle, Server, Zap, CheckCircle2 } from 'lucide-react';

interface ApiPredictionResponse {
  status: string;
  engine?: string;
  predicted_class: number;
  species: 'setosa' | 'versicolor' | 'virginica';
  display_name: string;
  confidence: number;
  probabilities: {
    setosa: number;
    versicolor: number;
    virginica: number;
  };
}

export const PredictorView: React.FC = () => {
  const [inputs, setInputs] = useState<FlowerInput>({
    sepal_length: 5.1,
    sepal_width: 3.5,
    petal_length: 1.4,
    petal_width: 0.2,
  });

  const [activePreset, setActivePreset] = useState<string>('Typical Setosa');
  const [apiResult, setApiResult] = useState<ApiPredictionResponse | null>(null);
  const [apiStatus, setApiStatus] = useState<'idle' | 'calling' | 'success' | 'fallback'>('idle');
  const [latency, setLatency] = useState<number | null>(null);

  // Instant client-side computation
  const { result: clientResult, error } = useMemo(() => {
    try {
      const pred = predictFlowerSpecies(inputs);
      return { result: pred, error: null };
    } catch (err: any) {
      return { result: null, error: err.message || 'Validation error' };
    }
  }, [inputs]);

  // Connect to Python serverless API (/api/predict)
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setApiStatus('calling');
      const start = performance.now();
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputs),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled && data.status === 'success') {
          setApiResult(data);
          setLatency(Math.max(1, Math.round(performance.now() - start)));
          setApiStatus('success');
        }
      } catch {
        if (!cancelled) {
          setApiStatus('fallback');
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inputs]);

  // Display Python API result if connected; otherwise seamlessly use client engine
  const activeResult = useMemo(() => {
    if (apiStatus === 'success' && apiResult) {
      return {
        species: apiResult.species,
        displayName: apiResult.display_name,
        confidence: Math.round(apiResult.confidence * 100),
        probabilities: apiResult.probabilities,
        engine: apiResult.engine || 'Python Scikit-Learn API',
        isApi: true,
      };
    }
    if (clientResult) {
      return {
        species: clientResult.species,
        displayName: clientResult.displayName,
        confidence: clientResult.confidence,
        probabilities: clientResult.probabilities,
        engine: clientResult.modelName,
        isApi: false,
      };
    }
    return null;
  }, [apiStatus, apiResult, clientResult]);

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
  }[activeResult?.species || 'setosa'];

  return (
    <div className="space-y-6">
      {/* Top Architecture Pill */}
      <div className="neu-flat rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between text-xs font-semibold text-slate-700 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-black uppercase tracking-wider text-slate-400 text-[10px]">Architecture</span>
          <span className="font-bold text-slate-800">React + Vite (Frontend)</span>
          <span className="text-slate-400">•</span>
          <span className="font-bold text-slate-800">Python ML (Backend API)</span>
        </div>

        <div className="flex items-center gap-2">
          {apiStatus === 'success' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Server className="w-3.5 h-3.5" />
              Python Scikit-Learn API ({latency}ms)
            </span>
          ) : apiStatus === 'calling' ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Calling /api/predict...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 font-bold border border-indigo-200" title="Zero-latency client fallback engine active">
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              Edge Client Engine Active
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Inputs & Controls */}
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
                min="1.5"
                max="5.0"
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

        {/* Right Column: Visualizer & Prediction Panel */}
        <div className="lg:col-span-6 space-y-6">
          {error ? (
            <div className="neu-flat rounded-2xl p-6 text-rose-700 neu-inset">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                Invalid Measurement
              </div>
              <p className="text-xs mt-1 font-medium">{error}</p>
            </div>
          ) : activeResult ? (
            <div className="neu-flat rounded-2xl p-6 space-y-6">
              {/* Dynamic 3D Flower Visualizer */}
              <div className="flex justify-center">
                <FlowerMorphologyVisualizer inputs={inputs} species={activeResult.species} />
              </div>

              {/* Elevated Result Banner */}
              <div className="neu-inset rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      Predicted Species
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-200 text-slate-700">
                      {activeResult.engine}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-black italic tracking-tight mt-1 ${speciesStyles.textColor}`}>
                    {activeResult.displayName}
                  </h3>
                </div>
                <div className={`px-4 py-2 rounded-xl text-white font-black text-sm ${speciesStyles.pillClass}`}>
                  {activeResult.confidence}% Match
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
                    <span className="font-mono">{(activeResult.probabilities.setosa * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${activeResult.probabilities.setosa * 100}%` }}
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
                    <span className="font-mono">{(activeResult.probabilities.versicolor * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${activeResult.probabilities.versicolor * 100}%` }}
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
                    <span className="font-mono">{(activeResult.probabilities.virginica * 100).toFixed(1)}%</span>
                  </div>
                  <div className="neu-inset h-3 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-amber-600 h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${activeResult.probabilities.virginica * 100}%` }}
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
