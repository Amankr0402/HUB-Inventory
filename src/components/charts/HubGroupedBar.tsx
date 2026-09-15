import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { SummaryMatrix } from '../../types';
import { formatNumber } from '../../utils/format';

interface HubGroupedBarProps {
  summary: SummaryMatrix;
  onSelectHub?: (hub: string) => void;
}

export const HubGroupedBar: React.FC<HubGroupedBarProps> = ({ summary, onSelectHub }) => {
  const data = summary.hubs.map((hub) => {
    const big = summary.getValue('Total Stock', 'Big', hub);
    const toy = summary.getValue('Total Stock', 'Toy', hub);
    const books = summary.getValue('Total Stock', 'Books', hub);
    const total = big + toy + books;

    return {
      hub,
      shortName: hub.replace(/( Hub| HUB| Library| the EleFant Play Arena - )/gi, '').trim(),
      Big: big,
      Toy: toy,
      Books: books,
      Total: total,
    };
  }).sort((a, b) => b.Total - a.Total);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl shadow-xl border border-purple-100 text-xs space-y-2 z-50 min-w-[180px]">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1">{item.hub}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-teal-700 font-medium">
              <span>Big Toys:</span>
              <span className="font-bold">{formatNumber(item.Big)}</span>
            </div>
            <div className="flex items-center justify-between text-purple-700 font-medium">
              <span>Standard Toys:</span>
              <span className="font-bold">{formatNumber(item.Toy)}</span>
            </div>
            <div className="flex items-center justify-between text-amber-700 font-medium">
              <span>Books:</span>
              <span className="font-bold">{formatNumber(item.Books)}</span>
            </div>
            <div className="border-t border-slate-100 pt-1 flex items-center justify-between font-extrabold text-slate-900">
              <span>Total Units:</span>
              <span>{formatNumber(item.Total)}</span>
            </div>
          </div>
          <p className="text-[10px] text-purple-600 italic">Click bar to view hub detail</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 25 }}
          onClick={(state: any) => {
            if (state && state.activePayload && state.activePayload.length) {
              const clickedHub = state.activePayload[0].payload.hub;
              if (onSelectHub) onSelectHub(clickedHub);
            }
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DAFF" opacity={0.5} />
          <XAxis
            dataKey="shortName"
            angle={-30}
            textAnchor="end"
            interval={0}
            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
            height={40}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '8px', fontSize: '12px' }}
          />
          <Bar dataKey="Toy" name="Toys" stackId="a" fill="#7C3AED" radius={[0, 0, 0, 0]} className="cursor-pointer" />
          <Bar dataKey="Big" name="Big" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} className="cursor-pointer" />
          <Bar dataKey="Books" name="Books" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} className="cursor-pointer" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
