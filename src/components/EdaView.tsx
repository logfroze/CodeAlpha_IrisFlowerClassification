import React, { useState } from 'react';
import { IRIS_SAMPLES, IRIS_STATISTICS, IRIS_CORRELATION } from '../data/irisData';
import { BarChart2, Grid } from 'lucide-react';

export const EdaView: React.FC = () => {
  const [xAxis, setXAxis] = useState<string>('petal_length');
  const [yAxis, setYAxis] = useState<string>('petal_width');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const featureOptions = [
    { key: 'sepal_length', label: 'Sepal Length (cm)', min: 4.0, max: 8.5 },
    { key: 'sepal_width', label: 'Sepal Width (cm)', min: 1.8, max: 4.6 },
    { key: 'petal_length', label: 'Petal Length (cm)', min: 0.8, max: 7.2 },
    { key: 'petal_width', label: 'Petal Width (cm)', min: 0.0, max: 2.8 },
  ];

  const currentX = featureOptions.find((f) => f.key === xAxis)!;
  const currentY = featureOptions.find((f) => f.key === yAxis)!;

  const speciesColor = {
    setosa: '#2563eb',     // Blue
    versicolor: '#059669', // Green
    virginica: '#d97706',  // Amber
  };

  const svgWidth = 540;
  const svgHeight = 360;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const getSvgX = (val: number) => {
    return padding.left + ((val - currentX.min) / (currentX.max - currentX.min)) * plotWidth;
  };

  const getSvgY = (val: number) => {
    return padding.top + plotHeight - ((val - currentY.min) / (currentY.max - currentY.min)) * plotHeight;
  };

  return (
    <div className="space-y-6">
      {/* 2D Feature Scatter & Correlation Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scatter Plot */}
        <div className="lg:col-span-7 neu-flat rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              Feature Scatter (N=150)
            </h2>

            {/* Selectors */}
            <div className="flex items-center gap-2 text-xs">
              <select
                aria-label="X-Axis feature"
                value={xAxis}
                onChange={(e) => setXAxis(e.target.value)}
                className="neu-btn px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                {featureOptions.map((f) => (
                  <option key={f.key} value={f.key}>
                    X: {f.label.split(' ')[0]}
                  </option>
                ))}
              </select>

              <select
                aria-label="Y-Axis feature"
                value={yAxis}
                onChange={(e) => setYAxis(e.target.value)}
                className="neu-btn px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 outline-none cursor-pointer"
              >
                {featureOptions.map((f) => (
                  <option key={f.key} value={f.key}>
                    Y: {f.label.split(' ')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SVG Canvas in Neumorphic Inset Well */}
          <div className="relative neu-inset rounded-2xl p-3 overflow-x-auto">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto max-w-[540px] mx-auto select-none">
              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                const y = padding.top + plotHeight * pct;
                const xVal = currentX.min + (currentX.max - currentX.min) * pct;
                const x = padding.left + plotWidth * pct;
                const yVal = currentY.min + (currentY.max - currentY.min) * (1 - pct);
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + plotWidth}
                      y2={y}
                      stroke="rgba(166, 180, 200, 0.5)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="end"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {yVal.toFixed(1)}
                    </text>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + plotHeight}
                      stroke="rgba(166, 180, 200, 0.5)"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={x}
                      y={padding.top + plotHeight + 16}
                      fontSize="9"
                      fill="#64748b"
                      textAnchor="middle"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {xVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Data points */}
              {IRIS_SAMPLES.map((sample, idx) => {
                const cx = getSvgX(sample[xAxis as keyof typeof sample] as number);
                const cy = getSvgY(sample[yAxis as keyof typeof sample] as number);
                const color = speciesColor[sample.species];
                const isHovered = hoveredPoint === sample;

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 7 : 4.5}
                    fill={color}
                    opacity={isHovered ? 1 : 0.85}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-all duration-150 filter drop-shadow-xs"
                    onMouseEnter={() => setHoveredPoint(sample)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}
            </svg>

            {/* Hover tooltip */}
            {hoveredPoint && (
              <div className="absolute top-4 right-4 neu-flat rounded-xl p-2.5 text-xs font-mono shadow-lg border border-white/80">
                <div className="font-bold capitalize text-slate-800">Iris {hoveredPoint.species}</div>
                <div className="text-[11px] text-slate-600">
                  Sepal: {hoveredPoint.sepal_length} × {hoveredPoint.sepal_width} cm
                </div>
                <div className="text-[11px] text-slate-600">
                  Petal: {hoveredPoint.petal_length} × {hoveredPoint.petal_width} cm
                </div>
              </div>
            )}
          </div>

          {/* Color legend */}
          <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-600 shadow-xs" /> Setosa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-xs" /> Versicolor
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-600 shadow-xs" /> Virginica
            </span>
          </div>
        </div>

        {/* Pearson Correlation Heatmap */}
        <div className="lg:col-span-5 neu-flat rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase flex items-center gap-2">
              <Grid className="w-4 h-4 text-blue-600" />
              Pearson Correlation (r)
            </h2>
          </div>

          <div className="neu-inset rounded-2xl p-3">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-left font-bold text-slate-600">Feature</th>
                  <th className="p-2 font-mono font-bold text-[11px] text-slate-600">Sepal L</th>
                  <th className="p-2 font-mono font-bold text-[11px] text-slate-600">Sepal W</th>
                  <th className="p-2 font-mono font-bold text-[11px] text-slate-600">Petal L</th>
                  <th className="p-2 font-mono font-bold text-[11px] text-slate-600">Petal W</th>
                </tr>
              </thead>
              <tbody>
                {['sepal_length', 'sepal_width', 'petal_length', 'petal_width'].map((rowKey) => {
                  const labelMap: Record<string, string> = {
                    sepal_length: 'Sepal L',
                    sepal_width: 'Sepal W',
                    petal_length: 'Petal L',
                    petal_width: 'Petal W',
                  };
                  return (
                    <tr key={rowKey}>
                      <td className="p-2 text-left font-bold text-slate-700 text-xs">
                        {labelMap[rowKey]}
                      </td>
                      {['sepal_length', 'sepal_width', 'petal_length', 'petal_width'].map((colKey) => {
                        const val = IRIS_CORRELATION[rowKey]?.[colKey] ?? (rowKey === colKey ? 1.0 : 0.0);
                        let tileClass = 'neu-flat text-slate-700';
                        if (val === 1) {
                          tileClass = 'neu-inset text-slate-900 font-bold';
                        } else if (val >= 0.8) {
                          tileClass = 'neu-pill-blue text-white font-black shadow-xs';
                        } else if (val >= 0.4) {
                          tileClass = 'bg-blue-200/90 text-blue-900 font-bold';
                        } else if (val <= -0.3) {
                          tileClass = 'bg-rose-500 text-white font-bold shadow-xs';
                        }

                        return (
                          <td key={colKey} className="p-1">
                            <div className={`p-2 rounded-xl text-xs font-mono font-bold ${tileClass}`}>
                              {val.toFixed(2)}
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

      {/* Descriptive Statistics Table in 3D Neumorphic Panel */}
      <div className="neu-flat rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-black text-slate-800 tracking-wide uppercase">
          Summary Statistics
        </h2>

        <div className="overflow-x-auto neu-inset rounded-xl p-1">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-600 font-bold border-b border-slate-300/60">
              <tr>
                <th className="py-2.5 px-4">Feature</th>
                <th className="py-2.5 px-4 font-mono">Count</th>
                <th className="py-2.5 px-4 font-mono">Mean</th>
                <th className="py-2.5 px-4 font-mono">Std</th>
                <th className="py-2.5 px-4 font-mono">Min</th>
                <th className="py-2.5 px-4 font-mono">25%</th>
                <th className="py-2.5 px-4 font-mono">Median</th>
                <th className="py-2.5 px-4 font-mono">75%</th>
                <th className="py-2.5 px-4 font-mono">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 font-mono text-slate-700">
              {[
                { name: 'sepal_length', label: 'Sepal Length (cm)' },
                { name: 'sepal_width', label: 'Sepal Width (cm)' },
                { name: 'petal_length', label: 'Petal Length (cm)' },
                { name: 'petal_width', label: 'Petal Width (cm)' },
              ].map((feat) => {
                const s = IRIS_STATISTICS[feat.name] || {};
                return (
                  <tr key={feat.name} className="hover:bg-slate-200/40">
                    <td className="py-2.5 px-4 font-sans font-bold text-slate-900">{feat.label}</td>
                    <td className="py-2.5 px-4">{s.count ?? 150}</td>
                    <td className="py-2.5 px-4 font-bold text-blue-700">{s.mean?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4">{s.std?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4">{s.min?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4">{s['25%']?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{s['50%']?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4">{s['75%']?.toFixed(2) ?? '-'}</td>
                    <td className="py-2.5 px-4">{s.max?.toFixed(2) ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
