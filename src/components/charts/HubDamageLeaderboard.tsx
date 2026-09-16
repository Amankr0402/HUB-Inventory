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
import { AlertOctagon, ArrowUpDown, AlignLeft, BarChart2, Table, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react';
import type { HubDamageItem } from '../../types';
import { Avatar } from '../ui/Avatar';
import { formatNumber, formatPercent } from '../../utils/format';

interface HubDamageLeaderboardProps {
  items: HubDamageItem[];
  onSelectHub?: (hub: string) => void;
  onDrilldownDamages?: (hub: string) => void;
}

type SortField = 'damages' | 'damageRate' | 'damageToy' | 'damageBig' | 'damageBooks';
type ViewMode = 'ranked' | 'bars' | 'table';

export const HubDamageLeaderboard: React.FC<HubDamageLeaderboardProps> = ({
  items,
  onSelectHub,
  onDrilldownDamages,
}) => {
  const [sortBy, setSortBy] = useState<SortField>('damages');
  const [viewMode, setViewMode] = useState<ViewMode>('ranked');

  const sortedData = [...items].sort((a, b) => {
    return b[sortBy] - a[sortBy];
  });

  const totalNetworkDamages = items.reduce((sum, item) => sum + item.damages, 0);
  const maxDamage = sortedData[0]?.damages || 1;
  const worstHub = sortedData[0];
  const bestHub = [...items].sort((a, b) => a.damages - b.damages)[0];

  const handleRowClick = (hub: string) => {
    if (onDrilldownDamages) {
      onDrilldownDamages(hub);
    } else if (onSelectHub) {
      onSelectHub(hub);
    }
  };

  const renderCustomBarLabel = (props: any) => {
    const { x, y, width, height, index } = props;
    if (index === undefined || !sortedData[index]) return null;
    const item = sortedData[index];
    return (
      <text
        x={x + width + 8}
        y={y + height / 2 + 4}
        fill="#991B1B"
        fontSize={11}
        fontWeight={800}
        textAnchor="start"
      >
        {formatNumber(item.damages)}{' '}
        <tspan fill="#64748B" fontWeight={500} fontSize={10}>
          ({formatPercent(item.damageRate)})
        </tspan>
      </text>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Headline Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/80 via-amber-50/60 to-purple-50/50 border border-rose-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800/80 block">
              Total Network Damages
            </span>
            <span className="text-xl font-black text-rose-950">
              {formatNumber(totalNetworkDamages)} <span className="text-xs font-normal text-rose-700">units</span>
            </span>
          </div>
        </div>

        {worstHub && (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 border border-rose-100/80 shadow-2xs">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 font-semibold block">Highest Damage Volume</span>
              <span className="text-xs font-black text-rose-700 truncate block">
                {worstHub.hub}: <strong>{formatNumber(worstHub.damages)}</strong>
              </span>
            </div>
          </div>
        )}

        {bestHub && (
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/80 border border-emerald-100/80 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 font-semibold block">Lowest Damage Volume</span>
              <span className="text-xs font-black text-emerald-700 truncate block">
                {bestHub.hub}: <strong>{formatNumber(bestHub.damages)}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-purple-100/60">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-100 text-xs">
          <button
            onClick={() => setViewMode('ranked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'ranked'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Top-to-Bottom List</span>
          </button>

          <button
            onClick={() => setViewMode('bars')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'bars'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Horizontal Bars</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === 'table'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Data Matrix</span>
          </button>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium hidden sm:inline">Rank by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortField)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer shadow-xs"
          >
            <option value="damages">Total Damage Count (High to Low)</option>
            <option value="damageRate">Damage Rate %</option>
            <option value="damageToy">Toy Damages</option>
            <option value="damageBig">Big Toy Damages</option>
            <option value="damageBooks">Book Damages</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: TOP-TO-BOTTOM RANKED CARDS */}
      {viewMode === 'ranked' && (
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {sortedData.map((item, index) => {
            const barWidth = Math.max((item.damages / maxDamage) * 100, 2);
            const isTop3 = index < 3;

            return (
              <div
                key={item.hub}
                onClick={() => handleRowClick(item.hub)}
                className="p-3 rounded-xl bg-white hover:bg-rose-50/60 border border-slate-200/80 hover:border-rose-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isTop3
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <Avatar initials={item.initials} color={item.color} size="sm" />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-rose-700 transition-colors truncate">
                          {item.hub}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-rose-600 transition-colors" />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatNumber(item.totalStock)} Total Units in Hub • {formatPercent(item.damageRate)} Defect Rate
                      </span>
                    </div>
                  </div>

                  {/* Right side numbers */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                      <span className="text-purple-700 font-bold">{formatNumber(item.damageToy)} Toys</span>
                      <span>•</span>
                      <span className="text-teal-700 font-bold">{formatNumber(item.damageBig)} Big</span>
                      <span>•</span>
                      <span className="text-amber-700 font-bold">{formatNumber(item.damageBooks)} Books</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-right shadow-2xs group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <span className="font-black text-xs text-rose-900 group-hover:text-white block leading-tight">
                        {formatNumber(item.damages)}
                      </span>
                      <span className="text-[9px] font-bold text-rose-600 group-hover:text-rose-100 block">
                        Damaged Units
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar representing share of worst damage */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5 border border-slate-200/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: HORIZONTAL BARS */}
      {viewMode === 'bars' && (
        <div className="w-full h-96 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 110, left: 15, bottom: 5 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  handleRowClick(state.activePayload[0].payload.hub);
                }
              }}
            >
              <XAxis type="number" hide domain={[0, 'dataMax + 400']} />
              <YAxis
                type="category"
                dataKey="hub"
                width={140}
                tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
              />
              <Tooltip
                formatter={(value: any) => [`${formatNumber(value)} Damaged Units`, 'Damages']}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '10px',
                  border: '1px solid #FECDD3',
                  fontSize: '11px',
                  fontWeight: 'bold',
                }}
              />
              <Bar
                dataKey="damages"
                radius={[0, 6, 6, 0]}
                className="cursor-pointer"
              >
                {sortedData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#E11D48' : index < 3 ? '#F43F5E' : '#FB7185'}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
                <LabelList content={renderCustomBarLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* VIEW 3: DATA MATRIX TABLE */}
      {viewMode === 'table' && (
        <div className="border border-rose-100 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-rose-50/90 text-rose-900 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-rose-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Hub Name</th>
                  <th className="py-2.5 px-3 text-right text-purple-800">Toy Damages</th>
                  <th className="py-2.5 px-3 text-right text-teal-800">Big Toy Damages</th>
                  <th className="py-2.5 px-3 text-right text-amber-800">Book Damages</th>
                  <th className="py-2.5 px-3 text-right text-rose-900 font-black">Total Damages</th>
                  <th className="py-2.5 px-3 text-right">Damage Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 bg-white">
                {sortedData.map((item, idx) => (
                  <tr
                    key={item.hub}
                    onClick={() => handleRowClick(item.hub)}
                    className="hover:bg-rose-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-900 hover:text-rose-700 flex items-center gap-1.5">
                      {item.hub}
                      <ExternalLink className="w-3 h-3 text-slate-300" />
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-purple-800">{formatNumber(item.damageToy)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-teal-800">{formatNumber(item.damageBig)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-amber-800">{formatNumber(item.damageBooks)}</td>
                    <td className="py-2 px-3 text-right font-black text-rose-700 bg-rose-50/30">
                      {formatNumber(item.damages)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-slate-700">
                      {formatPercent(item.damageRate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
