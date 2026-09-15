import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import type { DetailRow } from '../../types';
import { formatNumber } from '../../utils/format';

export const SkuDonut: React.FC<{ row: DetailRow }> = ({ row }) => {
  const data = [
    { name: 'Available', value: row.available_stock, color: '#10B981' },
    { name: 'Rented Out', value: row.rented_out, color: '#7C3AED' },
    { name: 'Damages', value: row.damaged_stock, color: '#F59E0B' },
  ].filter((d) => d.value > 0);

  return (
    <div className="flex items-center justify-between p-4 bg-purple-50/50 rounded-xl border border-purple-100">
      <div className="w-24 h-24 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any, name: any) => [`${value} units`, name]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #E4DAFF',
                fontSize: '11px',
              }}
            />
            <Pie
              data={data.length > 0 ? data : [{ name: 'None', value: 1, color: '#E2E8F0' }]}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {(data.length > 0 ? data : [{ name: 'None', value: 1, color: '#E2E8F0' }]).map(
                (entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                )
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-extrabold text-slate-800">{formatNumber(row.total_stock)}</span>
          <span className="text-[9px] text-slate-400">Total</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs flex-1 ml-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Available:
          </span>
          <span className="font-bold text-slate-800">{formatNumber(row.available_stock)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            Rented Out:
          </span>
          <span className="font-bold text-slate-800">{formatNumber(row.rented_out)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Damages:
          </span>
          <span className="font-bold text-slate-800">{formatNumber(row.damaged_stock)}</span>
        </div>
      </div>
    </div>
  );
};
