/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { PredictorView } from './components/PredictorView';
import { ModelBenchmarksView } from './components/ModelBenchmarksView';
import { EdaView } from './components/EdaView';
import { DataTableView } from './components/DataTableView';
import { CodeViewer } from './components/CodeViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('predictor');

  return (
    <div className="min-h-screen bg-[#e8edf5] text-slate-900 flex flex-col font-sans select-none antialiased">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4">
        {activeTab === 'predictor' && <PredictorView />}
        {activeTab === 'benchmarks' && <ModelBenchmarksView />}
        {activeTab === 'eda' && <EdaView />}
        {activeTab === 'data' && <DataTableView />}
        {activeTab === 'code' && <CodeViewer />}
      </main>

      <footer className="py-4 text-center text-xs font-bold text-slate-500">
        CodeAlpha • Iris Flower Classification • Fisher Dataset
      </footer>
    </div>
  );
}
