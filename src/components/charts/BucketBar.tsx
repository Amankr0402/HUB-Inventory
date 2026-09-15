import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
} from 'recharts';
import { AlignLeft, BarChart2, Zap, Clock, Calendar } from 'lucide-react';
import type { ChartBucketItem } from '../../types';
import { formatNumber } from '../../utils/format';

interface BucketBarProps {
  data: ChartBucketItem[];
  onBarClick?: (bucket: string) => void;
}

const BucketTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-purple-100 text-xs space-y-1 z-50">
        <p className="font-bold text-slate-800">{item.label}</p>
        <p className="text-purple-700 font-semibold">
          {formatNumber(item.count)} SKUs ({item.percentage.toFixed(1)}%)
        </p>
        <p className="text-[10px] text-slate-400">Click to drill down</p>
      </div>
    );
  }
  return null;
};

export const BucketBar: React.FC<BucketBarProps> = ({ data, onBarClick }) => {
  const [view, setView] = useState<'meters' | 'chart'>('meters');

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No availability bucket data
      </div>
    );
  }

  const getBucketColor = (label: string) => {
    if (label.includes('1-3')) return { bg: 'bg-emerald-500', text: 'text-emerald-700', chip: 'bg-emerald-50 border-emerald-200', hex: '#10B981' };
    if (label.includes('7-8')) return { bg: 'bg-cyan-500', text: 'text-cyan-700', chip: 'bg-cyan-50 border-cyan-200', hex: '#06B6D4' };
    if (label.includes('9-12') || label.includes('10-12')) return { bg: 'bg-purple-600', text: 'text-purple-700', chip: 'bg-purple-50 border-purple-200', hex: '#7C3AED' };
    return { bg: 'bg-amber-500', text: 'text-amber-700', chip: 'bg-amber-50 border-amber-200', hex: '#F59E0B' };
  };

  const getBucketIcon = (label: string) => {
    if (label.includes('1-3')) return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
    if (label.includes('7-8')) return <Clock className="w-3.5 h-3.5 text-cyan-600" />;
    return <Calendar className="w-3.5 h-3.5 text-purple-600" />;
  };

  const maxVal = data[0]?.count || 1;

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    if (index === undefined || !data[index]) return null;
    const item = data[index];
    return (
      <text
        x={x + width + 8}
        y={y + height / 2 + 4}
        fill="#334155"
        fontSize={11}
        fontWeight={700}
        textAnchor="start"
      >
        {formatNumber(item.count)}{' '}
        <tspan fill="#64748B" fontWeight={500} fontSize={10}>
          ({item.percentage.toFixed(1)}%)
        </tspan>
      </text>
    );
  };

  return (
    <div className="space-y-3">
      {/* View Toggle */}
      <div className="flex items-center justify-between pb-1 border-b border-purple-50">
        <span className="text-[11px] text-slate-500 font-medium">Turnaround time distribution</span>
        <div className="flex items-center gap-1 bg-purple-50 p-0.5 rounded-lg border border-purple-100 text-[10px]">
          <button
            onClick={() => setView('meters')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
              view === 'meters' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <AlignLeft className="w-3 h-3" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setView('chart')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md font-bold transition-all ${
              view === 'chart' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Chart</span>
          </button>
        </div>
      </div>

      {view === 'meters' ? (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {data.map((item) => {
            const colors = getBucketColor(item.label);
            const barWidth = Math.max((item.count / maxVal) * 100, 2);

            return (
              <div
                key={item.label}
                onClick={() => onBarClick && onBarClick(item.label)}
                className="p-2.5 rounded-xl bg-slate-50/80 hover:bg-purple-50/90 border border-slate-200/70 hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`p-1 rounded-md ${colors.chip} border shrink-0`}>
                      {getBucketIcon(item.label)}
                    </span>
                    <span className="font-bold text-xs text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                      {item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-extrabold text-xs text-slate-900">
                      {formatNumber(item.count)} <span className="text-[10px] text-slate-400 font-normal">SKUs</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${colors.chip} ${colors.text} border`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${colors.bg} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full h-60 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.slice(0, 6)}
              layout="vertical"
              margin={{ top: 5, right: 90, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 'dataMax + 800']} />
              <YAxis
                type="category"
                dataKey="label"
                width={130}
                tick={{ fill: '#4B5563', fontSize: 10.5, fontWeight: 600 }}
              />
              <Tooltip content={<BucketTooltip />} />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                onClick={(entry: any) => onBarClick && onBarClick(entry?.label || entry?.name || '')}
                className="cursor-pointer"
              >
                {data.slice(0, 6).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getBucketColor(entry.label).hex}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
                <LabelList content={renderCustomLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
