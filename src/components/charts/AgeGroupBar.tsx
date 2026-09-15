import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import type { ChartBucketItem } from '../../types';
import { formatNumber } from '../../utils/format';

interface AgeGroupBarProps {
  data: ChartBucketItem[];
  onBarClick?: (ageGroup: string) => void;
}

const AGE_COLORS = ['#059669', '#0891B2', '#7C3AED', '#EA580C', '#D97706'];

export const AgeGroupBar: React.FC<AgeGroupBarProps> = ({ data, onBarClick }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-slate-400">
        No age group data
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
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

  return (
    <div className="w-full h-52">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={90}
            tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 500 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="count"
            radius={[0, 6, 6, 0]}
            onClick={(entry: any) => onBarClick && onBarClick(entry?.label || entry?.name || '')}
            className="cursor-pointer"
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={AGE_COLORS[index % AGE_COLORS.length]}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
