import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { useData } from '../store/DataContext';
import { filterDetailRows } from '../data/drilldown';
import type { DetailRow, ToyType } from '../types';
import { Card } from '../components/ui/Card';
import { DrilldownTable } from '../components/tables/DrilldownTable';
import { Drawer } from '../components/ui/Drawer';
import { formatNumber } from '../utils/format';

export const DrilldownPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { summaryMatrix, detailRows, hubs, isLoading } = useData();

  // Read URL query params with defaults
  const paramMetric = searchParams.get('metric') || 'Total Stock';
  const paramType = (searchParams.get('type') || 'All') as ToyType;
  const paramHub = searchParams.get('hub') || 'All';

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>(paramHub);
  const [selectedToyType, setSelectedToyType] = useState<ToyType>(paramType);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [visibleOnly, setVisibleOnly] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<string>('All');

  // Selected toy for Drawer
  const [selectedDrawerToy, setSelectedDrawerToy] = useState<DetailRow | null>(null);

  // Sync state if query params change
  useEffect(() => {
    if (searchParams.get('hub')) {
      setSelectedHub(searchParams.get('hub') || 'All');
    }
    if (searchParams.get('type')) {
      setSelectedToyType((searchParams.get('type') || 'All') as ToyType);
    }
  }, [searchParams]);

  // Update query params when user alters primary selectors
  const updateUrlParams = (newHub: string, newType: ToyType) => {
    setSelectedHub(newHub);
    setSelectedToyType(newType);
    const newParams = new URLSearchParams(searchParams);
    newParams.set('hub', newHub);
    newParams.set('type', newType);
    setSearchParams(newParams);
  };

  // Summary matrix reference value
  const summaryValue = useMemo(() => {
    if (!summaryMatrix) return 0;
    return summaryMatrix.getValue(paramMetric, selectedToyType, selectedHub);
  }, [summaryMatrix, paramMetric, selectedToyType, selectedHub]);

  // Filtered detail rows
  const drilldownResult = useMemo(() => {
    return filterDetailRows(
      detailRows,
      {
        metric: paramMetric,
        type: selectedToyType,
        hub: selectedHub,
      },
      {
        search,
        ageGroups: selectedAgeGroups,
        visibleOnly,
        availabilityBucket: selectedBucket !== 'All' ? selectedBucket : undefined,
      }
    );
  }, [
    detailRows,
    paramMetric,
    selectedToyType,
    selectedHub,
    search,
    selectedAgeGroups,
    visibleOnly,
    selectedBucket,
  ]);

  const isMatching = summaryValue === drilldownResult.recomputedSum;

  const standardAgeGroups = [
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-8 years',
    '8-12 years',
  ];

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

  const toggleAgeGroup = (ag: string) => {
    if (selectedAgeGroups.includes(ag)) {
      setSelectedAgeGroups(selectedAgeGroups.filter((g) => g !== ag));
    } else {
      setSelectedAgeGroups([...selectedAgeGroups, ag]);
    }
  };

  if (isLoading && !summaryMatrix) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-purple-800">Loading drill-down inventory records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 pt-2">
        <Link to="/" className="hover:text-purple-700 transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-purple-700">
          {selectedHub === 'All' ? 'All Hubs' : selectedHub}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-purple-700">
          {selectedToyType === 'All' ? 'All Types' : `${selectedToyType} Toys`}
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{paramMetric}</span>
      </nav>

      {/* Header Verification Card */}
      <Card topBorderColor="#7C3AED" className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
              Drill-down Target Metric
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {paramMetric}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Filtered by: <strong>{selectedHub}</strong> • <strong>{selectedToyType}</strong>
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

        {/* Verification Summary vs Detail Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-purple-100">
          <div className="bg-[#F5F0FF] p-4 rounded-xl border border-[#E4DAFF]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Summary Metric Value
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-900">
              {formatNumber(summaryValue)}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Recomputed Detail Sum
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {formatNumber(drilldownResult.recomputedSum)}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Data Verification
              </span>
              <div className="text-xs font-medium text-slate-600">
                {drilldownResult.rows.length} SKU rows
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
                  Diff: {Math.abs(summaryValue - drilldownResult.recomputedSum)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Row Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <Filter className="w-4 h-4 text-purple-600" />
            <span>Interactive Filters</span>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by toy title or hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-purple-50/40 border border-purple-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-purple-50 text-xs">
          {/* Hub Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Hub:</span>
            <select
              value={selectedHub}
              onChange={(e) => updateUrlParams(e.target.value, selectedToyType)}
              className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              <option value="All">All Hubs (14)</option>
              {hubs.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Toy Type Pills */}
          <div className="flex items-center gap-1 bg-[#F5F0FF] p-1 rounded-lg border border-[#E4DAFF]">
            {(['All', 'Big', 'Toy', 'Books'] as ToyType[]).map((t) => (
              <button
                key={t}
                onClick={() => updateUrlParams(selectedHub, t)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedToyType === t
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Availability Bucket */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-medium">Bucket:</span>
            <select
              value={selectedBucket}
              onChange={(e) => setSelectedBucket(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-purple-400"
            >
              {availabilityBuckets.map((b) => (
                <option key={b} value={b}>
                  {b === 'All' ? 'All Buckets' : b}
                </option>
              ))}
            </select>
          </div>

          {/* Visible Only Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 select-none ml-auto">
            <input
              type="checkbox"
              checked={visibleOnly}
              onChange={(e) => setVisibleOnly(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-400"
            />
            <span>Visible Only</span>
          </label>
        </div>

        {/* Age Group Multi-Select Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-purple-50 text-xs">
          <span className="text-slate-500 font-medium">Age Filter:</span>
          {standardAgeGroups.map((ag) => {
            const isSelected = selectedAgeGroups.includes(ag);
            return (
              <button
                key={ag}
                onClick={() => toggleAgeGroup(ag)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                  isSelected
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white text-slate-600 border-purple-200 hover:border-purple-400'
                }`}
              >
                {ag}
              </button>
            );
          })}
          {selectedAgeGroups.length > 0 && (
            <button
              onClick={() => setSelectedAgeGroups([])}
              className="text-[11px] text-purple-600 hover:underline ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </Card>

      {/* TanStack Table Card */}
      <Card className="p-5">
        <DrilldownTable
          rows={drilldownResult.rows}
          metricValueColumn={drilldownResult.metricValueColumn}
          onRowClick={(row) => setSelectedDrawerToy(row)}
        />
      </Card>

      {/* Right Drawer */}
      <Drawer
        toy={selectedDrawerToy}
        allRows={detailRows}
        isOpen={Boolean(selectedDrawerToy)}
        onClose={() => setSelectedDrawerToy(null)}
        onSelectOtherToy={(row) => setSelectedDrawerToy(row)}
      />
    </div>
  );
};
