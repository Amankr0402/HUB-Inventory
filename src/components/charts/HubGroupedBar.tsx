import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { AlignLeft, BarChart2, Table as TableIcon } from 'lucide-react';
import type { SummaryMatrix } from '../../types';
import { formatNumber, formatPercent } from '../../utils/format';

interface HubGroupedBarProps {
  summary: SummaryMatrix;
  onSelectHub?: (hub: string) => void;
}

type ViewMode = 'horizontal' | 'stacked' | 'table';

const HubTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-2xl border border-purple-200 text-xs space-y-2 z-50 min-w-[210px]">
        <div className="flex items-center justify-between border-b border-purple-100 pb-1.5">
          <p className="font-extrabold text-slate-800">{item.hub}</p>
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold text-[10px]">
            Total: {formatNumber(item.Total)}
          </span>
        </div>

        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-purple-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              Standard Toys:
            </span>
            <span className="font-bold text-slate-900">
              {formatNumber(item.Toy)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                ({formatPercent(item.Total > 0 ? item.Toy / item.Total : 0)})
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-teal-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
              Big Toys:
            </span>
            <span className="font-bold text-slate-900">
              {formatNumber(item.Big)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                ({formatPercent(item.Total > 0 ? item.Big / item.Total : 0)})
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-amber-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Books:
            </span>
            <span className="font-bold text-slate-900">
              {formatNumber(item.Books)}{' '}
              <span className="text-[10px] text-slate-400 font-normal">
                ({formatPercent(item.Total > 0 ? item.Books / item.Total : 0)})
              </span>
            </span>
          </div>
        </div>

        <p className="text-[10px] text-purple-600 font-semibold pt-1 border-t border-purple-50 text-center">
          👉 Click to open hub detailed breakdown
        </p>
      </div>
    );
  }
  return null;
};

export const HubGroupedBar: React.FC<HubGroupedBarProps> = ({ summary, onSelectHub }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('horizontal');
  const [sortBy, setSortBy] = useState<'Total' | 'Toy' | 'Big' | 'Books'>('Total');

  const data = summary.hubs
    .map((hub) => {
      const big = summary.getValue('Total Stock', 'Big', hub);
      const toy = summary.getValue('Total Stock', 'Toy', hub);
      const books = summary.getValue('Total Stock', 'Books', hub);
      const total = big + toy + books;

      // Clean, recognizable short names for axis labels
      let cleanShort = hub
        .replace('the EleFant Play Arena - ', '')
        .replace('Yogita\'s Toy Library', 'Yogita\'s Library')
        .replace('Andheri Hub - Mumbai', 'Andheri (Mumbai)')
        .replace('Bangalore - Varthur Hub', 'Bangalore (Varthur)')
        .replace(' Hub', '')
        .replace(' HUB', '');

      return {
        hub,
        shortName: cleanShort,
        Big: big,
        Toy: toy,
        Books: books,
        Total: total,
      };
    })
    .sort((a, b) => b[sortBy] - a[sortBy]);

  // Custom label for the top of vertical stacked bars
  const renderTopTotalLabel = (props: any) => {
    const { x, y, width, index } = props;
    if (index === undefined || !data[index]) return null;
    const totalVal = data[index].Total;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#475569"
        textAnchor="middle"
        fontSize={10.5}
        fontWeight={700}
        className="select-none pointer-events-none"
      >
        {totalVal >= 1000 ? `${(totalVal / 1000).toFixed(1)}k` : totalVal}
      </text>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-purple-100/70">
        <div className="flex items-center gap-1 bg-purple-50/80 p-1 rounded-xl border border-purple-100 text-xs">
          <button
            onClick={() => setViewMode('horizontal')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'horizontal'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-100/50'
            }`}
            title="Horizontal layout with full names and clear numbers"
          >
            <AlignLeft className="w-3.5 h-3.5" />
            <span>Ranked List</span>
          </button>

          <button
            onClick={() => setViewMode('stacked')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'stacked'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-100/50'
            }`}
            title="Vertical stacked column chart"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Vertical Columns</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-purple-700 hover:bg-purple-100/50'
            }`}
            title="Tabular matrix view"
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Data Grid</span>
          </button>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white border border-purple-200 text-slate-700 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-sm"
          >
            <option value="Total">Total Stock (Units)</option>
            <option value="Toy">Toys Only</option>
            <option value="Big">Big Toys Only</option>
            <option value="Books">Books Only</option>
          </select>
        </div>
      </div>

      {/* VIEW 1: HORIZONTAL RANKED LIST (SUPER READABLE & CLEAR NUMBERS) */}
      {viewMode === 'horizontal' && (
        <div className="space-y-2 pt-1">
          {/* Legend */}
          <div className="flex items-center justify-end gap-4 text-xs font-semibold px-2 py-1">
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Toys
            </span>
            <span className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600" /> Big Toys
            </span>
            <span className="flex items-center gap-1.5 text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Books
            </span>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {data.map((item, index) => {
              const maxTotal = data[0]?.Total || 1;
              const barWidthPct = (item.Total / maxTotal) * 100;

              const toyPct = item.Total > 0 ? (item.Toy / item.Total) * 100 : 0;
              const bigPct = item.Total > 0 ? (item.Big / item.Total) * 100 : 0;
              const booksPct = item.Total > 0 ? (item.Books / item.Total) * 100 : 0;

              return (
                <div
                  key={item.hub}
                  onClick={() => onSelectHub && onSelectHub(item.hub)}
                  className="p-2.5 rounded-xl bg-slate-50/70 hover:bg-purple-50/80 border border-slate-200/80 hover:border-purple-300 transition-all cursor-pointer group"
                >
                  {/* Top line: Hub name, rank & exact numbers */}
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-extrabold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-800 group-hover:text-purple-700 truncate transition-colors">
                        {item.hub}
                      </span>
                    </div>

                    {/* Exact numbers pills */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mr-1">
                        <span className="text-purple-700 font-bold">{formatNumber(item.Toy)}</span>
                        <span>+</span>
                        <span className="text-teal-700 font-bold">{formatNumber(item.Big)}</span>
                        <span>+</span>
                        <span className="text-amber-700 font-bold">{formatNumber(item.Books)}</span>
                        <span>=</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-white border border-purple-200 shadow-sm text-xs font-black text-slate-900 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        {formatNumber(item.Total)} units
                      </span>
                    </div>
                  </div>

                  {/* Multi-segment Progress Bar */}
                  <div className="w-full bg-slate-200/60 rounded-full h-3.5 flex overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-l-full flex overflow-hidden transition-all duration-500"
                      style={{ width: `${barWidthPct}%` }}
                    >
                      {item.Toy > 0 && (
                        <div
                          style={{ width: `${toyPct}%` }}
                          className="h-full bg-purple-600 hover:brightness-110 transition-all"
                          title={`Toys: ${formatNumber(item.Toy)} (${toyPct.toFixed(1)}%)`}
                        />
                      )}
                      {item.Big > 0 && (
                        <div
                          style={{ width: `${bigPct}%` }}
                          className="h-full bg-teal-600 hover:brightness-110 transition-all"
                          title={`Big Toys: ${formatNumber(item.Big)} (${bigPct.toFixed(1)}%)`}
                        />
                      )}
                      {item.Books > 0 && (
                        <div
                          style={{ width: `${booksPct}%` }}
                          className="h-full bg-amber-500 rounded-r-full hover:brightness-110 transition-all"
                          title={`Books: ${formatNumber(item.Books)} (${booksPct.toFixed(1)}%)`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: VERTICAL STACKED BAR WITH LABELS ON TOP */}
      {viewMode === 'stacked' && (
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 25, right: 10, left: -10, bottom: 45 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clickedHub = state.activePayload[0].payload.hub;
                  if (onSelectHub) onSelectHub(clickedHub);
                }
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4DAFF" opacity={0.6} />
              <XAxis
                dataKey="shortName"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fill: '#4B5563', fontSize: 11, fontWeight: 600 }}
                height={50}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
              />
              <Tooltip content={<HubTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 600 }}
              />
              <Bar dataKey="Toy" name="Toys" stackId="a" fill="#7C3AED" radius={[0, 0, 0, 0]} className="cursor-pointer" />
              <Bar dataKey="Big" name="Big" stackId="a" fill="#0D9488" radius={[0, 0, 0, 0]} className="cursor-pointer" />
              <Bar
                dataKey="Books"
                name="Books"
                stackId="a"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                className="cursor-pointer"
              >
                <LabelList content={renderTopTotalLabel} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* VIEW 3: DATA GRID MATRIX */}
      {viewMode === 'table' && (
        <div className="border border-purple-100 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto max-h-[440px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-purple-50/90 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-purple-200">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Hub / Library</th>
                  <th className="py-2.5 px-3 text-right text-purple-700">Toys</th>
                  <th className="py-2.5 px-3 text-right text-teal-700">Big Toys</th>
                  <th className="py-2.5 px-3 text-right text-amber-700">Books</th>
                  <th className="py-2.5 px-3 text-right text-slate-900 font-black">Total Stock</th>
                  <th className="py-2.5 px-3 text-center">Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-50 bg-white">
                {data.map((item, idx) => {
                  const toyPct = item.Total > 0 ? (item.Toy / item.Total) * 100 : 0;
                  const bigPct = item.Total > 0 ? (item.Big / item.Total) * 100 : 0;
                  const booksPct = item.Total > 0 ? (item.Books / item.Total) * 100 : 0;

                  return (
                    <tr
                      key={item.hub}
                      onClick={() => onSelectHub && onSelectHub(item.hub)}
                      className="hover:bg-purple-50/70 cursor-pointer transition-colors"
                    >
                      <td className="py-2 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-800 hover:text-purple-700">{item.hub}</td>
                      <td className="py-2 px-3 text-right font-semibold text-purple-800">{formatNumber(item.Toy)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-teal-800">{formatNumber(item.Big)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-amber-800">{formatNumber(item.Books)}</td>
                      <td className="py-2 px-3 text-right font-extrabold text-slate-900 bg-purple-50/30">
                        {formatNumber(item.Total)}
                      </td>
                      <td className="py-2 px-3">
                        <div className="w-24 bg-slate-100 rounded-full h-2.5 flex overflow-hidden mx-auto">
                          <div style={{ width: `${toyPct}%` }} className="bg-purple-600" title={`Toys: ${toyPct.toFixed(0)}%`} />
                          <div style={{ width: `${bigPct}%` }} className="bg-teal-600" title={`Big: ${bigPct.toFixed(0)}%`} />
                          <div style={{ width: `${booksPct}%` }} className="bg-amber-500" title={`Books: ${booksPct.toFixed(0)}%`} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
