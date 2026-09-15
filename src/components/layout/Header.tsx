import React, { useState } from 'react';
import { Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { useData } from '../../store/DataContext';
import { Link as RouterLink } from 'react-router-dom';
import brandLogo from '../../assets/logo.png';

export const Header: React.FC = () => {
  const { dataTimestamp, isCachedFallback, isLoading, refetch } = useData();
  const [imgError, setImgError] = useState(false);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-white border-b border-purple-100/60 shadow-[0_2px_12px_rgba(109,40,217,0.04)] sticky top-0 z-30 transition-all">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Wordmark */}
        <div className="flex items-center gap-4">
          <RouterLink to="/" className="flex items-center gap-2 group transition-transform active:scale-95" title="the EleFant Dashboard Home">
            {!imgError ? (
              <img
                src={brandLogo}
                alt="the EleFant"
                className="h-11 w-auto max-w-[180px] object-contain select-none"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#66497F] flex items-center justify-center text-white shadow-sm shadow-purple-900/20">
                  <span className="text-xl">🐘</span>
                </div>
                <div className="flex items-baseline font-bold text-2xl tracking-tight" style={{ fontFamily: "'Fredoka', sans-serif" }}>
                  <span className="text-[#F4AD38]">the EleFant</span>
                </div>
              </div>
            )}
          </RouterLink>

          {/* Vertical Divider */}
          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Timestamp & Badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Data as of <strong className="text-slate-700">{dataTimestamp || 'Loading...'}</strong></span>
            {isCachedFallback && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200" title="Using local cached snapshot">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Cached Data
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="p-1 hover:bg-purple-50 text-purple-600 rounded-md transition-colors disabled:opacity-50"
              title="Refresh live data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Date Pill & Export as PDF */}
        <div className="flex items-center gap-3">
          {/* Today's Date Pill */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F0FF] border border-[#E4DAFF] text-purple-700 text-xs font-semibold shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span>{todayStr}</span>
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handlePrint}
            className="no-print flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6] text-white text-xs sm:text-sm font-semibold shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span className="hidden xs:inline">Export as PDF</span>
            <span className="xs:hidden">PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
