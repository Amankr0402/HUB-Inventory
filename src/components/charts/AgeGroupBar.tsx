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
import { ListFilter, BarChart2, Sparkles, Smile, Baby, Rocket, Award } from 'lucide-react';
import type { ChartBucketItem } from '../../types';
import { formatNumber } from '../../utils/format';

interface AgeGroupBarProps {
  data: ChartBucketItem[];
  onBarClick?: (ageGroup: string) => void;
}

const AGE_CONFIG: Record<
  string,
  {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    bgTrack: string;
    chipBg: string;
    chipText: string;
    hex: string;
  }
> = {
  '0-1 years': {
    title: 'Infants (0–1 yrs)',
    subtitle: 'Rattles, sensory & soft development toys',
    icon: <Baby className="w-4 h-4 text-emerald-600" />,
    color: 'from-emerald-500 to-teal-600',
    bgTrack: 'bg-emerald-500',
    chipBg: 'bg-emerald-50 border-emerald-200',
    chipText: 'text-emerald-800',
    hex: '#059669',
  },
  '1-3 years': {
    title: 'Toddlers (1–3 yrs)',
    subtitle: 'Motor skills, activity walkers & stackers',
    icon: <Smile className="w-4 h-4 text-cyan-600" />,
    color: 'from-cyan-500 to-blue-600',
    bgTrack: 'bg-cyan-600',
    chipBg: 'bg-cyan-50 border-cyan-200',
    chipText: 'text-cyan-800',
    hex: '#0891B2',
  },
  '3-5 years': {
    title: 'Preschool (3–5 yrs)',
    subtitle: 'Pretend play, basic STEM & puzzle games',
    icon: <Sparkles className="w-4 h-4 text-purple-600" />,
    color: 'from-purple-500 to-indigo-600',
    bgTrack: 'bg-purple-600',
    chipBg: 'bg-purple-50 border-purple-200',
    chipText: 'text-purple-800',
    hex: '#7C3AED',
  },
  '5-8 years': {
    title: 'Early Primary (5–8 yrs)',
    subtitle: 'Board games, construction & advanced books',
    icon: <Rocket className="w-4 h-4 text-orange-600" />,
    color: 'from-orange-500 to-amber-600',
    bgTrack: 'bg-orange-500',
    chipBg: 'bg-orange-50 border-orange-200',
    chipText: 'text-orange-800',
    hex: '#EA580C',
  },
  '8-12 years': {
    title: 'Pre-Teens (8–12 yrs)',
    subtitle: 'Robotics, strategy puzzles & chapter series',
    icon: <Award className="w-4 h-4 text-amber-600" />,
    color: 'from-amber-500 to-yellow-600',
    bgTrack: 'bg-amber-500',
    chipBg: 'bg-amber-50 border-amber-200',
    chipText: 'text-amber-800',
    hex: '#D97706',
  },
};

const AgeGroupTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-purple-100 text-xs space-y-1 z-50">
        <p className="font-bold text-slate-800">{item.label}</p>
        <p className="text-purple-700 font-semibold">
          {formatNumber(item.count)} SKUs ({item.percentage.toFixed(1)}% of catalog)
        </p>
        <p className="text-[10px] text-slate-400">Click to drill down</p>
      </div>
    );
  }
  return null;
};

export const AgeGroupBar: React.FC<AgeGroupBarProps> = ({ data, onBarClick }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards');

  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No age group data
      </div>
    );
  }

  // Find the highest coverage age group
  const highestItem = [...data].sort((a, b) => b.count - a.count)[0];
  const maxVal = highestItem?.count || 1;

  const renderCustomLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    if (index === undefined || !data[index]) return null;
    const item = data[index];
    return (
      <text
        x={x + width + 8}
        y={y + height / 2 + 4}
        fill="#1E293B"
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
      {/* Top Header Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-100/70">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-700">Catalog Multi-Tag Share</span>
          {highestItem && (
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px]">
              {highestItem.label}: {highestItem.percentage.toFixed(1)}% Core
            </span>
          )}
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
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold transition-all ${
              viewMode === 'chart'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Chart</span>
          </button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="space-y-2.5">
          {data.map((item) => {
            const cfg = AGE_CONFIG[item.label] || {
              title: item.label,
              subtitle: 'Age targeted toys',
              icon: <Smile className="w-4 h-4 text-purple-600" />,
              color: 'from-purple-500 to-indigo-600',
              bgTrack: 'bg-purple-600',
              chipBg: 'bg-purple-50 border-purple-200',
              chipText: 'text-purple-800',
              hex: '#7C3AED',
            };

            const isTop = item.label === highestItem?.label;
            const barWidth = Math.max((item.count / maxVal) * 100, 3);

            return (
              <div
                key={item.label}
                onClick={() => onBarClick && onBarClick(item.label)}
                className={`p-3 rounded-xl bg-white hover:bg-purple-50/70 border ${
                  isTop ? 'border-purple-300 ring-1 ring-purple-100 shadow-xs' : 'border-slate-200/80 hover:border-purple-300 shadow-xs'
                } hover:shadow-sm transition-all cursor-pointer group`}
              >
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`p-1.5 rounded-lg ${cfg.chipBg} border shrink-0 group-hover:scale-105 transition-transform`}>
                      {cfg.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-800 group-hover:text-purple-700 transition-colors truncate">
                          {cfg.title}
                        </span>
                        {isTop && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-wider">
                            Top Share
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {cfg.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="font-black text-xs text-slate-900 block">
                        {formatNumber(item.count)} <span className="text-[10px] text-slate-400 font-normal">SKUs</span>
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${cfg.chipBg} ${cfg.chipText} border shadow-2xs`}>
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${cfg.color} transition-all duration-500`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Recharts Vertical Bar with high padding & clean labels */
        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 90, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide domain={[0, 'dataMax + 1200']} />
              <YAxis
                type="category"
                dataKey="label"
                width={95}
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip content={<AgeGroupTooltip />} />
              <Bar
                dataKey="count"
                radius={[0, 6, 6, 0]}
                onClick={(entry: any) => onBarClick && onBarClick(entry?.label || entry?.name || '')}
                className="cursor-pointer"
              >
                {data.map((item, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={AGE_CONFIG[item.label]?.hex || '#7C3AED'}
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
