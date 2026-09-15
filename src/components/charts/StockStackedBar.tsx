import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { formatNumber, formatPercent } from '../../utils/format';

interface StockStackedBarProps {
  available: number;
  rented: number;
  damages: number;
  onDrilldown?: (metric: string) => void;
}

export const StockStackedBar: React.FC<StockStackedBarProps> = ({
  available,
  rented,
  damages,
  onDrilldown,
}) => {
  const total = available + rented + damages || 1;
  const data = [
    {
      name: 'Stock Breakdown',
      Available: available,
      'Rented Out': rented,
      Damages: damages,
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl shadow-xl border border-purple-100 text-xs space-y-2 z-50 min-w-[200px]">
          <p className="font-extrabold text-slate-800 border-b border-slate-100 pb-1">Stock Composition</p>
          <div className="space-y-1.5">
            {payload.map((entry: any) => {
              const pct = entry.value / total;
              return (
                <div key={entry.name} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 font-medium">{entry.name}:</span>
                  </div>
                  <div className="font-extrabold text-slate-900">
                    {formatNumber(entry.value)} <span className="text-slate-500 font-normal">({formatPercent(pct)})</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-purple-600 font-semibold pt-1 border-t border-purple-50 text-center">
            Click segment to view item details
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
        <span>Stock Composition Ratio</span>
        <span className="px-2 py-0.5 rounded-md bg-purple-100/70 text-purple-800 text-[11px] font-extrabold">
          {formatNumber(total)} units total
        </span>
      </div>

      <div className="h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            barCategoryGap={0}
          >
            <XAxis type="number" hide domain={[0, total]} />
            <YAxis type="category" dataKey="name" hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey="Available"
              stackId="a"
              fill="#10B981"
              radius={[6, 0, 0, 6]}
              onClick={() => onDrilldown && onDrilldown('Available')}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
            <Bar
              dataKey="Rented Out"
              stackId="a"
              fill="#7C3AED"
              onClick={() => onDrilldown && onDrilldown('Rented Out')}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
            <Bar
              dataKey="Damages"
              stackId="a"
              fill="#F59E0B"
              radius={[0, 6, 6, 0]}
              onClick={() => onDrilldown && onDrilldown('Damages')}
              className="cursor-pointer hover:opacity-90 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend with exact numbers */}
      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-purple-100/80 text-xs">
        <button
          onClick={() => onDrilldown && onDrilldown('Available')}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 text-left transition-all group"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 font-semibold">Available</span>
          </div>
          <span className="font-extrabold text-emerald-900 text-[11px] sm:text-xs">
            {formatNumber(available)}{' '}
            <span className="text-emerald-700 font-medium">({formatPercent(available / total)})</span>
          </span>
        </button>

        <button
          onClick={() => onDrilldown && onDrilldown('Rented Out')}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-purple-50/70 hover:bg-purple-100/70 border border-purple-100 text-left transition-all group"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0" />
            <span className="text-slate-700 font-semibold">Rented Out</span>
          </div>
          <span className="font-extrabold text-purple-900 text-[11px] sm:text-xs">
            {formatNumber(rented)}{' '}
            <span className="text-purple-700 font-medium">({formatPercent(rented / total)})</span>
          </span>
        </button>

        <button
          onClick={() => onDrilldown && onDrilldown('Damages')}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 text-left transition-all group"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-slate-700 font-semibold">Damages</span>
          </div>
          <span className="font-extrabold text-amber-900 text-[11px] sm:text-xs">
            {formatNumber(damages)}{' '}
            <span className="text-amber-700 font-medium">({formatPercent(damages / total)})</span>
          </span>
        </button>
      </div>
    </div>
  );
};
