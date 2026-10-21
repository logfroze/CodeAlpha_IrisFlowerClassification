import React, { useState, useMemo } from 'react';
import { IRIS_SAMPLES, IrisSample } from '../data/irisData';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export const DataTableView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof IrisSample>('sepal_length');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const filteredSamples = useMemo(() => {
    return IRIS_SAMPLES.filter((sample) => {
      if (speciesFilter !== 'all' && sample.species !== speciesFilter) {
        return false;
      }
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesSpecies = sample.species.toLowerCase().includes(term);
        const matchesValues =
          sample.sepal_length.toString().includes(term) ||
          sample.sepal_width.toString().includes(term) ||
          sample.petal_length.toString().includes(term) ||
          sample.petal_width.toString().includes(term);
        return matchesSpecies || matchesValues;
      }
      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [speciesFilter, searchTerm, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredSamples.length / pageSize) || 1;
  const paginatedSamples = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSamples.slice(start, start + pageSize);
  }, [filteredSamples, currentPage]);

  const handleSort = (field: keyof IrisSample) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleDownloadCsv = () => {
    const headers = ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'target', 'species'];
    const rows = IRIS_SAMPLES.map((s) => [
      s.sepal_length,
      s.sepal_width,
      s.petal_length,
      s.petal_width,
      s.target,
      s.species,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'iris_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* 3D Search & Filter Toolbar */}
      <div className="neu-flat rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Debossed Search Box */}
          <div className="relative neu-inset rounded-xl px-3 py-1.5 flex items-center">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Search measurements..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-medium text-slate-800 bg-transparent outline-none w-48"
            />
          </div>

          {/* 3D Tactile Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl neu-inset text-xs">
            <button
              onClick={() => {
                setSpeciesFilter('all');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                speciesFilter === 'all'
                  ? 'neu-btn-pressed text-slate-900'
                  : 'neu-btn text-slate-600'
              }`}
            >
              All (150)
            </button>
            <button
              onClick={() => {
                setSpeciesFilter('setosa');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                speciesFilter === 'setosa'
                  ? 'neu-pill-blue text-white'
                  : 'neu-btn text-slate-600'
              }`}
            >
              Setosa
            </button>
            <button
              onClick={() => {
                setSpeciesFilter('versicolor');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                speciesFilter === 'versicolor'
                  ? 'neu-pill-green text-white'
                  : 'neu-btn text-slate-600'
              }`}
            >
              Versicolor
            </button>
            <button
              onClick={() => {
                setSpeciesFilter('virginica');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                speciesFilter === 'virginica'
                  ? 'neu-pill-amber text-white'
                  : 'neu-btn text-slate-600'
              }`}
            >
              Virginica
            </button>
          </div>
        </div>

        {/* 3D Export Button */}
        <button
          onClick={handleDownloadCsv}
          className="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          Export CSV
        </button>
      </div>

      {/* 3D Table Container */}
      <div className="neu-flat rounded-2xl overflow-hidden p-2">
        <div className="overflow-x-auto neu-inset rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="text-slate-600 font-bold border-b border-slate-300/60 select-none">
              <tr>
                <th className="py-3 px-4 font-mono w-16">#</th>
                <th
                  onClick={() => handleSort('sepal_length')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-700"
                >
                  Sepal L (cm) {sortField === 'sepal_length' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('sepal_width')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-700"
                >
                  Sepal W (cm) {sortField === 'sepal_width' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('petal_length')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-700"
                >
                  Petal L (cm) {sortField === 'petal_length' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('petal_width')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-700"
                >
                  Petal W (cm) {sortField === 'petal_width' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => handleSort('species')}
                  className="py-3 px-4 cursor-pointer hover:text-blue-700"
                >
                  Species {sortField === 'species' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50 font-mono">
              {paginatedSamples.map((sample, idx) => {
                const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                const pillClass =
                  sample.species === 'setosa'
                    ? 'neu-pill-blue text-white'
                    : sample.species === 'versicolor'
                    ? 'neu-pill-green text-white'
                    : 'neu-pill-amber text-white';

                return (
                  <tr key={idx} className="hover:bg-slate-200/40 text-slate-700">
                    <td className="py-2.5 px-4 text-slate-400">{globalIndex}</td>
                    <td className="py-2.5 px-4">{sample.sepal_length.toFixed(1)}</td>
                    <td className="py-2.5 px-4">{sample.sepal_width.toFixed(1)}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{sample.petal_length.toFixed(1)}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{sample.petal_width.toFixed(1)}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold capitalize ${pillClass}`}>
                        Iris {sample.species}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3D Pagination Bar */}
        <div className="px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-600">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="neu-btn p-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="neu-btn p-2 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
