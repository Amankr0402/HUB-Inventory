import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Building2, Layers } from 'lucide-react';
import { useData } from '../../store/DataContext';
import type { ToyType } from '../../types';

export const GlobalFilterBar: React.FC<{
  hideHubSelector?: boolean;
}> = ({ hideHubSelector = false }) => {
  const { hubs, selectedHub, setSelectedHub, selectedToyType, setSelectedToyType } = useData();
  const [hubDropdownOpen, setHubDropdownOpen] = useState(false);
  const [hubSearch, setHubSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setHubDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHubs = hubs.filter((h) =>
    h.toLowerCase().includes(hubSearch.toLowerCase())
  );

  const toyTypes: { id: ToyType; label: string }[] = [
    { id: 'All', label: 'All Types' },
    { id: 'Big', label: 'Big Toys' },
    { id: 'Toy', label: 'Standard Toys' },
    { id: 'Books', label: 'Books' },
  ];

  return (
    <div className="no-print bg-white/90 backdrop-blur-md border-b border-purple-100/80 shadow-[0_2px_10px_rgba(109,40,217,0.03)] sticky top-16 z-20 py-3 transition-all mb-6">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
        {/* Hub Selector (Searchable Dropdown) */}
        {!hideHubSelector && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setHubDropdownOpen(!hubDropdownOpen)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-purple-200 hover:border-purple-400 text-slate-800 text-xs sm:text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400/30"
            >
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="max-w-[200px] truncate">
                {selectedHub === 'All' ? 'All Hubs (14 Libraries)' : selectedHub}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${hubDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {hubDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-72 bg-white rounded-xl shadow-xl border border-purple-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search inside dropdown */}
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search hub / library..."
                    value={hubSearch}
                    onChange={(e) => setHubSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-purple-50/50 border border-purple-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400"
                    autoFocus
                  />
                </div>

                {/* Hub options list */}
                <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
                  <button
                    onClick={() => {
                      setSelectedHub('All');
                      setHubDropdownOpen(false);
                      setHubSearch('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left font-medium transition-colors ${
                      selectedHub === 'All'
                        ? 'bg-purple-100 text-purple-800 font-semibold'
                        : 'hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    <span>All Hubs (14 Libraries)</span>
                    {selectedHub === 'All' && <Check className="w-3.5 h-3.5 text-purple-700" />}
                  </button>

                  {filteredHubs.map((hub) => (
                    <button
                      key={hub}
                      onClick={() => {
                        setSelectedHub(hub);
                        setHubDropdownOpen(false);
                        setHubSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left font-medium transition-colors ${
                        selectedHub === hub
                          ? 'bg-purple-100 text-purple-800 font-semibold'
                          : 'hover:bg-purple-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{hub}</span>
                      {selectedHub === hub && <Check className="w-3.5 h-3.5 text-purple-700 shrink-0" />}
                    </button>
                  ))}

                  {filteredHubs.length === 0 && (
                    <div className="py-3 text-center text-xs text-slate-400">
                      No hubs found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Toy Type Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F5F0FF] border border-[#E4DAFF] rounded-xl">
          <div className="px-2 text-[11px] font-semibold uppercase tracking-wider text-purple-400 hidden md:flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>Type:</span>
          </div>
          {toyTypes.map((t) => {
            const isActive = selectedToyType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedToyType(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-purple-700 shadow-pill font-bold'
                    : 'text-slate-600 hover:text-purple-700 hover:bg-purple-100/50'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
