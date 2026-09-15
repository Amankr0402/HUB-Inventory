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
        <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-xl border border-purple-100 text-xs space-y-1.5 z-50">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">Stock Composition</p>
          {payload.map((entry: any) => {
            const pct = (entry.value / total);
            return (
              <div key={entry.name} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-600 font-medium">{entry.name}:</span>
                </div>
                <div className="font-bold text-slate-900">
                  {formatNumber(entry.value)} <span className="text-slate-400 font-normal">({formatPercent(pct)})</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <span>Stock Composition</span>
        <span className="text-slate-400 font-normal text-[11px]">{formatNumber(total)} total units</span>
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

      {/* Legend with interactive click */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-purple-50 text-xs">
        <button
          onClick={() => onDrilldown && onDrilldown('Available')}
          className="flex items-center gap-1.5 hover:text-emerald-700 transition-colors group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
          <span className="text-slate-600 font-medium">Available</span>
          <span className="font-bold text-slate-800">{formatPercent(available / total)}</span>
        </button>

        <button
          onClick={() => onDrilldown && onDrilldown('Rented Out')}
          className="flex items-center gap-1.5 hover:text-purple-700 transition-colors group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 group-hover:scale-110 transition-transform" />
          <span className="text-slate-600 font-medium">Rented Out</span>
          <span className="font-bold text-slate-800">{formatPercent(rented / total)}</span>
        </button>

        <button
          onClick={() => onDrilldown && onDrilldown('Damages')}
          className="flex items-center gap-1.5 hover:text-amber-700 transition-colors group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 group-hover:scale-110 transition-transform" />
          <span className="text-slate-600 font-medium">Damages</span>
          <span className="font-bold text-slate-800">{formatPercent(damages / total)}</span>
        </button>
      </div>
    </div>
  );
};
