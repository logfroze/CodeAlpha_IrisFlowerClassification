import React from 'react';
import { FlowerInput, IrisSpecies } from '../utils/classifier';

interface VisualizerProps {
  inputs: FlowerInput;
  species: IrisSpecies;
}

export const FlowerMorphologyVisualizer: React.FC<VisualizerProps> = ({ inputs, species }) => {
  // Normalize scale for rendering within SVG (100x100 viewBox centered at 50,50)
  // Sepal length typically 4.0-8.0cm -> radius ~25-45
  // Sepal width typically 2.0-4.5cm -> petal width ratio
  // Petal length typically 1.0-7.0cm -> radius ~12-38
  const sepalLen = Math.max(15, Math.min(46, inputs.sepal_length * 5.5));
  const sepalWid = Math.max(8, Math.min(24, inputs.sepal_width * 5.0));
  const petalLen = Math.max(8, Math.min(40, inputs.petal_length * 5.8));
  const petalWid = Math.max(4, Math.min(18, inputs.petal_width * 7.5));

  const palette = {
    setosa: {
      sepalGrad: ['#60a5fa', '#2563eb', '#1d4ed8'],
      petalGrad: ['#93c5fd', '#3b82f6', '#1e40af'],
      centerGrad: ['#fde047', '#eab308'],
      glow: 'rgba(37, 99, 235, 0.4)',
    },
    versicolor: {
      sepalGrad: ['#34d399', '#059669', '#065f46'],
      petalGrad: ['#6ee7b7', '#10b981', '#047857'],
      centerGrad: ['#fef08a', '#eab308'],
      glow: 'rgba(5, 150, 105, 0.4)',
    },
    virginica: {
      sepalGrad: ['#fbbf24', '#d97706', '#92400e'],
      petalGrad: ['#fcd34d', '#f59e0b', '#b45309'],
      centerGrad: ['#fed7aa', '#f97316'],
      glow: 'rgba(217, 119, 6, 0.4)',
    },
  }[species];

  // Helper for generating 3 outer sepals at 0, 120, 240 deg
  const sepalAngles = [90, 210, 330];
  // Helper for generating 3 inner upright petals at 30, 150, 270 deg
  const petalAngles = [30, 150, 270];

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* 3D Elevated Neumorphic Plate for the Flower */}
      <div
        className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center neu-inset"
        style={{
          boxShadow: `inset 4px 4px 10px rgba(166,180,200,0.8), inset -4px -4px 10px rgba(255,255,255,0.9), 0 0 25px ${palette.glow}`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 select-none filter drop-shadow-md">
          <defs>
            {/* 3D Gradient for Sepals */}
            <radialGradient id="sepalGrad" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor={palette.sepalGrad[0]} />
              <stop offset="60%" stopColor={palette.sepalGrad[1]} />
              <stop offset="100%" stopColor={palette.sepalGrad[2]} />
            </radialGradient>

            {/* 3D Gradient for Petals */}
            <radialGradient id="petalGrad" cx="50%" cy="20%" r="80%">
              <stop offset="0%" stopColor={palette.petalGrad[0]} />
              <stop offset="65%" stopColor={palette.petalGrad[1]} />
              <stop offset="100%" stopColor={palette.petalGrad[2]} />
            </radialGradient>

            {/* Center Core */}
            <radialGradient id="centerGrad" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor={palette.centerGrad[0]} />
              <stop offset="100%" stopColor={palette.centerGrad[1]} />
            </radialGradient>
          </defs>

          {/* 1. Outer Sepals (3 petals spreading outwards) */}
          {sepalAngles.map((ang) => (
            <g key={`sepal-${ang}`} transform={`rotate(${ang} 50 50)`}>
              {/* Outer Sepal Leaf */}
              <path
                d={`M 50 50 Q ${50 - sepalWid} ${50 - sepalLen * 0.65} 50 ${50 - sepalLen} Q ${50 + sepalWid} ${50 - sepalLen * 0.65} 50 50`}
                fill="url(#sepalGrad)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="0.8"
                className="transition-all duration-300"
              />
              {/* Sepal Midrib vein for physical skeuomorphic depth */}
              <path
                d={`M 50 50 Q 50 ${50 - sepalLen * 0.5} 50 ${50 - sepalLen * 0.9}`}
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* 2. Inner True Petals (3 petals standing upright) */}
          {petalAngles.map((ang) => (
            <g key={`petal-${ang}`} transform={`rotate(${ang} 50 50)`}>
              {/* Inner Petal Leaf */}
              <path
                d={`M 50 50 Q ${50 - petalWid} ${50 - petalLen * 0.6} 50 ${50 - petalLen} Q ${50 + petalWid} ${50 - petalLen * 0.6} 50 50`}
                fill="url(#petalGrad)"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth="0.8"
                className="transition-all duration-300"
              />
              {/* Inner petal glossy highlight */}
              <ellipse
                cx="50"
                cy={50 - petalLen * 0.45}
                rx={petalWid * 0.3}
                ry={petalLen * 0.25}
                fill="rgba(255,255,255,0.3)"
              />
            </g>
          ))}

          {/* 3. Elevated 3D Core / Stigma */}
          <circle cx="50" cy="50" r="7" fill="url(#centerGrad)" stroke="#b45309" strokeWidth="0.6" />
          <circle cx="48" cy="48" r="2.5" fill="rgba(255,255,255,0.8)" />
        </svg>
      </div>

      {/* Dynamic Anatomy Labels */}
      <div className="flex items-center gap-4 mt-3 text-xs font-semibold">
        <span className="flex items-center gap-1.5 text-slate-700">
          <span
            className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
            style={{ backgroundColor: palette.sepalGrad[1] }}
          />
          Sepal: {inputs.sepal_length.toFixed(1)} × {inputs.sepal_width.toFixed(1)} cm
        </span>
        <span className="flex items-center gap-1.5 text-slate-700">
          <span
            className="w-3 h-3 rounded-full border border-white/60 shadow-xs"
            style={{ backgroundColor: palette.petalGrad[1] }}
          />
          Petal: {inputs.petal_length.toFixed(1)} × {inputs.petal_width.toFixed(1)} cm
        </span>
      </div>
    </div>
  );
};
