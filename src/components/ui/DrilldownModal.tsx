import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ExternalLink, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { filterDetailRows } from '../../data/drilldown';
import type { DetailRow, ToyType } from '../../types';
import { DrilldownTable } from '../tables/DrilldownTable';
import { Drawer } from './Drawer';
import { formatNumber } from '../../utils/format';

export const DrilldownModal: React.FC = () => {
  const { modalDrilldown, closeDrilldownModal, detailRows, summaryMatrix, hubs } = useData();
  const navigate = useNavigate();

  const [selectedDrawerToy, setSelectedDrawerToy] = useState<DetailRow | null>(null);

  // Local filter overrides inside modal
  const [search, setSearch] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<ToyType>('All');
  const [visibleOnly, setVisibleOnly] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>('All');

  // Reset or initialize filters when modal opens
  const activeParams = modalDrilldown;

  const currentHub = selectedHubFilter !== 'All' ? selectedHubFilter : (activeParams?.hub || 'All');
  const currentType = selectedTypeFilter !== 'All' ? selectedTypeFilter : (activeParams?.type || 'All');
  const currentMetric = activeParams?.metric || 'Total Stock';

  // Compute summary matrix value for this metric
  const summaryValue = useMemo(() => {
    if (!summaryMatrix || !activeParams) return 0;
    return summaryMatrix.getValue(currentMetric, currentType, currentHub);
  }, [summaryMatrix, activeParams, currentMetric, currentType, currentHub]);

  // Filter detail rows
  const drilldownResult = useMemo(() => {
    if (!activeParams) return { rows: [], metricValueColumn: 'total_stock' as const, recomputedSum: 0 };
    return filterDetailRows(
      detailRows,
      {
        metric: currentMetric,
        type: currentType,
        hub: currentHub,
      },
      {
        search,
        visibleOnly,
        availabilityBucket: selectedBucket !== 'All' ? selectedBucket : undefined,
      }
    );
  }, [detailRows, activeParams, currentMetric, currentType, currentHub, search, visibleOnly, selectedBucket]);

  if (!modalDrilldown) return null;

  const isMatching = summaryValue === drilldownResult.recomputedSum;

  const handleOpenFullPage = () => {
    closeDrilldownModal();
    const query = new URLSearchParams({
      metric: currentMetric,
      type: currentType,
      hub: currentHub,
    });
    navigate(`/drilldown?${query.toString()}`);
  };

  const availabilityBuckets = [
    'All',
    'Available in 1-3 Days',
    'Available in 7-8 Days',
    'Available in 9-12 Days',
    'Available in 10-12 Days',
    'Available in 11-13 Days',
    'Available in 12-14 Days',
    'Available in 13-15 Days',
    'Available in 16-18 Days',
    'Available in 17-18 Days',
    'Available in 18-18 Days',
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl shadow-2xl border border-purple-100 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-purple-100 flex items-center justify-between bg-gradient-to-r from-[#F5F0FF] to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                🔍
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-600">
                  <span>Drill-down Explorer</span>
                  <span>•</span>
                  <span>{currentHub === 'All' ? 'All Hubs' : currentHub}</span>
                  <span>•</span>
                  <span>{currentType === 'All' ? 'All Types' : `${currentType} Toys`}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {currentMetric}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenFullPage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-colors shadow-sm"
                title="Open in dedicated route"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Page</span>
              </button>
              <button
                onClick={closeDrilldownModal}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* Header KPI verification card */}
            <div className="bg-[#F5F0FF] rounded-xl p-4 border border-[#E4DAFF] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Summary Cell Value
                  </span>
                  <span className="text-2xl font-extrabold text-purple-900">
                    {formatNumber(summaryValue)}
                  </span>
                </div>

                <div className="h-8 w-px bg-purple-200" />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recomputed Detail Total
                  </span>
                  <span className="text-2xl font-extrabold text-slate-900">
                    {formatNumber(drilldownResult.recomputedSum)}
                  </span>
                </div>

                <div className="h-8 w-px bg-purple-200" />

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Matching SKU Rows
                  </span>
                  <span className="text-2xl font-extrabold text-slate-700">
                    {formatNumber(drilldownResult.rows.length)}
                  </span>
                </div>
              </div>

              <div>
                {isMatching ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Exact Match
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Diff: {Math.abs(summaryValue - drilldownResult.recomputedSum)} units
                  </span>
                )}
              </div>
            </div>

            {/* Quick Filters Row */}
            <div className="bg-white p-3 rounded-xl border border-purple-100 flex flex-wrap items-center gap-3 text-xs">
              {/* Search input */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter toys by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-purple-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>

              {/* Hub Dropdown */}
              <select
                value={currentHub}
                onChange={(e) => setSelectedHubFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-purple-100 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                <option value="All">All Hubs</option>
                {hubs.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>

              {/* Toy Type Pills */}
              <div className="flex items-center gap-1 bg-purple-50 p-1 rounded-lg border border-purple-100">
                {(['All', 'Big', 'Toy', 'Books'] as ToyType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTypeFilter(t)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      currentType === t
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-purple-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Visible Only Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none">
                <input
                  type="checkbox"
                  checked={visibleOnly}
                  onChange={(e) => setVisibleOnly(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-400"
                />
                <span>Visible Only</span>
              </label>

              {/* Availability Bucket Dropdown */}
              <select
                value={selectedBucket}
                onChange={(e) => setSelectedBucket(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-purple-100 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
              >
                {availabilityBuckets.map((b) => (
                  <option key={b} value={b}>
                    {b === 'All' ? 'All Buckets' : b}
                  </option>
                ))}
              </select>
            </div>

            {/* Drilldown TanStack Table */}
            <DrilldownTable
              rows={drilldownResult.rows}
              metricValueColumn={drilldownResult.metricValueColumn}
              metricName={currentMetric}
              onRowClick={(row) => setSelectedDrawerToy(row)}
            />
          </div>
        </div>
      </div>

      {/* Toy Detail Drawer */}
      <Drawer
        toy={selectedDrawerToy}
        allRows={detailRows}
        isOpen={Boolean(selectedDrawerToy)}
        onClose={() => setSelectedDrawerToy(null)}
        onSelectOtherToy={(row) => setSelectedDrawerToy(row)}
      />
    </>
  );
};
