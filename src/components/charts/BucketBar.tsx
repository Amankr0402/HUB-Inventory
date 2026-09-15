import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Zap, Clock, Calendar, AlertCircle, PieChart as PieIcon, ListFilter, ChevronDown, ChevronUp } from 'lucide-react';
import type { ChartBucketItem } from '../../types';
import { formatNumber } from '../../utils/format';

interface BucketBarProps {
  data: ChartBucketItem[];
  onBarClick?: (bucket: string) => void;
}

interface ConsolidatedBucket {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  count: number;
  percentage: number;
  color: string;
  bgGradient: string;
  chipBg: string;
  chipText: string;
  hex: string;
  drilldownKey: string;
  subBuckets?: ChartBucketItem[];
}

export const BucketBar: React.FC<BucketBarProps> = ({ data, onBarClick }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'donut'>('cards');
  const [showAllRaw, setShowAllRaw] = useState(false);

  // Consolidate raw buckets into meaningful, clean business tiers
  const { consolidated, totalSkus } = useMemo(() => {
    if (!data || data.length === 0) return { consolidated: [], totalSkus: 0 };

    let total = 0;
    let b1_3 = 0;
    let b7_8 = 0;
    let b9_12 = 0;
    let bExtended = 0;
    const extendedItems: ChartBucketItem[] = [];

    data.forEach((item) => {
      total += item.count;
      const lbl = item.label.toLowerCase();
      if (lbl.includes('1-3')) {
        b1_3 += item.count;
      } else if (lbl.includes('7-8')) {
        b7_8 += item.count;
      } else if (lbl.includes('9-12') || lbl.includes('10-12') || lbl.includes('11-13') || lbl.includes('12-14')) {
        b9_12 += item.count;
      } else {
        bExtended += item.count;
        extendedItems.push(item);
      }
    });

    const safeTotal = total || 1;

    const list: ConsolidatedBucket[] = [
      {
        id: '1-3',
        title: 'Immediate Delivery (1–3 Days)',
        subtitle: 'In-hub stock ready for immediate dispatch',
        icon: <Zap className="w-4 h-4 text-emerald-600" />,
        count: b1_3,
        percentage: (b1_3 / safeTotal) * 100,
        color: 'from-emerald-500 to-teal-600',
        bgGradient: 'bg-emerald-500',
        chipBg: 'bg-emerald-50 border-emerald-200',
        chipText: 'text-emerald-800',
        hex: '#10B981',
        drilldownKey: 'Available in 1-3 Days',
      },
      {
        id: '7-8',
        title: 'Standard Turnaround (7–8 Days)',
        subtitle: 'Scheduled batch replenishment',
        icon: <Clock className="w-4 h-4 text-cyan-600" />,
        count: b7_8,
        percentage: (b7_8 / safeTotal) * 100,
        color: 'from-cyan-500 to-blue-600',
        bgGradient: 'bg-cyan-500',
        chipBg: 'bg-cyan-50 border-cyan-200',
        chipText: 'text-cyan-800',
        hex: '#06B6D4',
        drilldownKey: 'Available in 7-8 Days',
      },
      {
        id: '9-12',
        title: 'Inter-Hub Transit (9–12 Days)',
        subtitle: 'Transfers across regional warehouses',
        icon: <Calendar className="w-4 h-4 text-purple-600" />,
        count: b9_12,
        percentage: (b9_12 / safeTotal) * 100,
        color: 'from-purple-500 to-indigo-600',
        bgGradient: 'bg-purple-600',
        chipBg: 'bg-purple-50 border-purple-200',
        chipText: 'text-purple-800',
        hex: '#7C3AED',
        drilldownKey: 'Available in 9-12 Days',
      },
      {
        id: '13+',
        title: 'Extended Lead Time (13+ Days)',
        subtitle: 'Restocking / special orders',
        icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
        count: bExtended,
        percentage: (bExtended / safeTotal) * 100,
        color: 'from-amber-500 to-orange-600',
        bgGradient: 'bg-amber-500',
        chipBg: 'bg-amber-50 border-amber-200',
        chipText: 'text-amber-800',
        hex: '#F59E0B',
        drilldownKey: 'Available in 13-15 Days',
        subBuckets: extendedItems,
      },
    ].filter((b) => b.count > 0);

    return { consolidated: list, totalSkus: total };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No availability bucket data
      </div>
    );
  }

  const donutData = consolidated.map((c) => ({
    name: c.title.split('(')[0].trim(),
    value: c.count,
    color: c.hex,
    percentage: c.percentage,
  }));

  return (
    <div className="space-y-3">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-100/70">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700">Turnaround Speed</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
            {consolidated[0]?.percentage.toFixed(1)}% Instant Ready
          </span>
        </div>

        <div className="flex items-center gap-1 bg-purple-50 p-0.5 rounded-lg border border-purple-100 text-[10px]">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all ${
              viewMode === 'cards'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <ListFilter className="w-3 h-3" />
            <span>Clean List</span>
          </button>
          <button
            onClick={() => setViewMode('donut')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all ${
              viewMode === 'donut'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <PieIcon className="w-3 h-3" />
            <span>Donut</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-2.5">
          {consolidated.map((bucket) => {
            const barWidth = Math.max(bucket.percentage, 2);

            return (
              <div
                key={bucket.id}
                onClick={() => onBarClick && onBarClick(bucket.drilldownKey)}
                className="p-3 rounded-xl bg-white hover:bg-purple-50/70 border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1.5 rounded-lg ${bucket.chipBg} border shrink-0 group-hover:scale-105 transition-transform`}>
                      {bucket.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-800 group-hover:text-purple-700 transition-colors block truncate">
                        {bucket.title}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {bucket.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 block">
                        {formatNumber(bucket.count)} <span className="text-[10px] text-slate-400 font-normal">SKUs</span>
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${bucket.chipBg} ${bucket.chipText} border shadow-2xs`}>
                      {bucket.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${bucket.color} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Raw breakdown dropdown for full transparency */}
          {data.length > 3 && (
            <div className="pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllRaw(!showAllRaw);
                }}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-700 hover:text-purple-900 transition-colors mx-auto"
              >
                <span>{showAllRaw ? 'Hide granular bucket breakdown' : `View all ${data.length} raw timeframes`}</span>
                {showAllRaw ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAllRaw && (
                <div className="mt-2 p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1.5 max-h-48 overflow-y-auto">
                  {data.map((item) => (
                    <div
                      key={item.label}
                      onClick={() => onBarClick && onBarClick(item.label)}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white text-xs cursor-pointer border border-transparent hover:border-purple-200 transition-all"
                    >
                      <span className="font-semibold text-slate-700">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{formatNumber(item.count)} SKUs</span>
                        <span className="text-purple-700 font-extrabold text-[11px]">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Donut View */
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3">
          <div className="w-36 h-36 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [`${formatNumber(value)} SKUs`, name]}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    border: '1px solid #E4DAFF',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-black text-slate-900">{formatNumber(totalSkus)}</span>
              <span className="text-[9px] text-slate-400 font-bold">Total SKUs</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs flex-1 w-full">
            {consolidated.map((b) => (
              <div
                key={b.id}
                onClick={() => onBarClick && onBarClick(b.drilldownKey)}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.hex }} />
                  <span className="font-semibold text-slate-700 truncate">{b.title.split('(')[0]}</span>
                </div>
                <span className="font-bold text-slate-900">
                  {formatNumber(b.count)}{' '}
                  <span className="text-slate-400 font-normal">({b.percentage.toFixed(1)}%)</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
