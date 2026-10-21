import React from 'react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'predictor', label: 'Predictor', icon: '🌸' },
    { id: 'benchmarks', label: 'Benchmarks', icon: '📊' },
    { id: 'eda', label: 'Analytics', icon: '📈' },
    { id: 'data', label: 'Dataset', icon: '📋' },
    { id: 'code', label: 'Code & Terminal', icon: '💻' },
  ];

  return (
    <header className="px-4 py-4 max-w-7xl mx-auto w-full">
      <div className="neu-flat rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl neu-flat flex items-center justify-center text-2xl shadow-md border-t border-white/80">
            🌸
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Iris Classifier
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full neu-pill-blue text-white shadow-xs">
                ML Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Skeuo-Neumorphic Botanical Classification Engine
            </p>
          </div>
        </div>

        {/* 3D Skeuo-Neumorphic Navigation Bar */}
        <nav
          className="flex items-center gap-2 p-1.5 rounded-xl neu-inset overflow-x-auto no-scrollbar"
          aria-label="Tabs"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'neu-btn-pressed text-blue-700'
                    : 'neu-btn text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
