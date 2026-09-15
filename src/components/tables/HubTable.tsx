import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import type { HubSummary, ToyType } from '../../types';
import { formatNumber, formatPercent } from '../../utils/format';
import { Avatar } from '../ui/Avatar';
import { getAvatarColor } from '../../utils/colors';

interface HubTableProps {
  summaries: HubSummary[];
  selectedToyType: ToyType;
  onCellClick: (metric: string, hub: string) => void;
}

type SortField = keyof HubSummary;

export const HubTable: React.FC<HubTableProps> = ({
  summaries,
  selectedToyType: _selectedToyType,
  onCellClick,
}) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('totalStock');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedData = useMemo(() => {
    return [...summaries].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        const cmp = (aVal as string).localeCompare(bVal as string);
        return sortDir === 'asc' ? cmp : -cmp;
      }

      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [summaries, sortField, sortDir]);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-purple-600" />
    ) : (
      <ArrowDown className="w-3 h-3 text-purple-600" />
    );
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-purple-100 shadow-sm bg-white">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F5F0FF]/80 text-slate-600 border-b border-purple-100 select-none">
            <th
              onClick={() => handleSort('hub')}
              className="py-3.5 px-4 font-bold cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <span>Hub / Library</span>
                {renderSortIcon('hub')}
              </div>
            </th>
            <th
              onClick={() => handleSort('subscribers')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Subscribers</span>
                {renderSortIcon('subscribers')}
              </div>
            </th>
            <th
              onClick={() => handleSort('totalStock')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Total Stock</span>
                {renderSortIcon('totalStock')}
              </div>
            </th>
            <th
              onClick={() => handleSort('rentedOut')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Rented Out</span>
                {renderSortIcon('rentedOut')}
              </div>
            </th>
            <th
              onClick={() => handleSort('available')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Available</span>
                {renderSortIcon('available')}
              </div>
            </th>
            <th
              onClick={() => handleSort('damages')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Damages</span>
                {renderSortIcon('damages')}
              </div>
            </th>
            <th
              onClick={() => handleSort('uniqueSkus')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Unique SKUs</span>
                {renderSortIcon('uniqueSkus')}
              </div>
            </th>
            <th
              onClick={() => handleSort('utilisationRate')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Utilisation %</span>
                {renderSortIcon('utilisationRate')}
              </div>
            </th>
            <th
              onClick={() => handleSort('damageRate')}
              className="py-3.5 px-3 font-bold text-right cursor-pointer group hover:text-purple-700 transition-colors"
            >
              <div className="flex items-center justify-end gap-1.5">
                <span>Damage %</span>
                {renderSortIcon('damageRate')}
              </div>
            </th>
            <th className="py-3.5 px-3 font-bold text-center w-10">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-50 text-slate-700">
          {sortedData.map((row) => {
            const avatar = getAvatarColor(row.hub);
            return (
              <tr
                key={row.hub}
                className="hover:bg-purple-50/40 transition-colors group cursor-pointer"
              >
                {/* Hub Name + Avatar */}
                <td
                  onClick={() => navigate(`/hub/${encodeURIComponent(row.hub)}`)}
                  className="py-3 px-4 font-semibold text-slate-900"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={row.hub.substring(0, 2).toUpperCase()} color={avatar.hex} size="sm" />
                    <span className="hover:text-purple-700 hover:underline transition-colors flex items-center gap-1">
                      {row.hub}
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-purple-600 transition-opacity" />
                    </span>
                    {!row.invariantValid && (
                      <span title="Invariant mismatch for this hub">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      </span>
                    )}
                  </div>
                </td>

                {/* Subscribers */}
                <td
                  onClick={() => onCellClick('Active Subscribers', row.hub)}
                  className="py-3 px-3 text-right font-medium hover:bg-purple-100/50 hover:text-purple-900 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.subscribers)}
                </td>

                {/* Total Stock */}
                <td
                  onClick={() => onCellClick('Total Stock', row.hub)}
                  className="py-3 px-3 text-right font-bold text-slate-900 hover:bg-emerald-50 hover:text-emerald-700 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.totalStock)}
                </td>

                {/* Rented Out */}
                <td
                  onClick={() => onCellClick('Rented Out', row.hub)}
                  className="py-3 px-3 text-right font-semibold text-purple-700 hover:bg-purple-100 hover:text-purple-900 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.rentedOut)}
                </td>

                {/* Available */}
                <td
                  onClick={() => onCellClick('Available', row.hub)}
                  className="py-3 px-3 text-right font-semibold text-emerald-700 hover:bg-emerald-100 hover:text-emerald-900 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.available)}
                </td>

                {/* Damages */}
                <td
                  onClick={() => onCellClick('Damages', row.hub)}
                  className="py-3 px-3 text-right font-semibold text-amber-600 hover:bg-amber-100 hover:text-amber-900 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.damages)}
                </td>

                {/* Unique SKUs */}
                <td
                  onClick={() => onCellClick('Unique SKUs', row.hub)}
                  className="py-3 px-3 text-right font-medium text-slate-700 hover:bg-purple-100/50 hover:text-purple-900 rounded-md transition-colors"
                  title="Click to drill down"
                >
                  {formatNumber(row.uniqueSkus)}
                </td>

                {/* Utilisation Rate % */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-bold text-purple-700">
                      {formatPercent(row.utilisationRate)}
                    </span>
                    <div className="w-12 h-1.5 rounded-full bg-purple-100 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${Math.min(100, row.utilisationRate * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Damage Rate % */}
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`font-bold ${row.damageRate > 0.15 ? 'text-amber-600 font-extrabold' : 'text-slate-600'}`}>
                      {formatPercent(row.damageRate)}
                    </span>
                    <div className="w-12 h-1.5 rounded-full bg-amber-100 overflow-hidden hidden sm:block">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${Math.min(100, row.damageRate * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>

                {/* Action arrow */}
                <td
                  onClick={() => navigate(`/hub/${encodeURIComponent(row.hub)}`)}
                  className="py-3 px-3 text-center text-slate-400 hover:text-purple-600"
                  title="View Hub Dashboard"
                >
                  <ExternalLink className="w-3.5 h-3.5 inline-block" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
