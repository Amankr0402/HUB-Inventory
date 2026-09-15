import React, { useMemo } from 'react';
import { X, CheckCircle2, XCircle, AlertCircle, Building2 } from 'lucide-react';
import type { DetailRow } from '../../types';
import { formatNumber, formatDate } from '../../utils/format';
import { ToyTypeBadge, AgeGroupChips } from './Badge';
import { SkuDonut } from '../charts/SkuDonut';

interface DrawerProps {
  toy: DetailRow | null;
  allRows: DetailRow[];
  isOpen: boolean;
  onClose: () => void;
  onSelectOtherToy?: (row: DetailRow) => void;
}

export const Drawer: React.FC<DrawerProps> = ({
  toy,
  allRows,
  isOpen,
  onClose,
  onSelectOtherToy,
}) => {
  if (!isOpen || !toy) return null;

  // Find other occurrences of this toy across hubs
  const sameToyAcrossHubs = useMemo(() => {
    return allRows.filter(
      (r) => r.toy_name.toLowerCase() === toy.toy_name.toLowerCase()
    );
  }, [allRows, toy.toy_name]);

  const totalAcrossAllHubs = useMemo(() => {
    return sameToyAcrossHubs.reduce((sum, r) => sum + r.total_stock, 0);
  }, [sameToyAcrossHubs]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      {/* Right Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col border-l border-purple-100 animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-purple-100 flex items-start justify-between bg-gradient-to-r from-purple-50/60 to-white">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ToyTypeBadge type={toy.toy_type} />
                <span className="text-xs font-semibold text-slate-500">SKU Details</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {toy.toy_name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Current Hub Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  {toy.library_name}
                </span>
                <span className="text-purple-700">Stock Distribution</span>
              </div>
              <SkuDonut row={toy} />
            </div>

            {/* SKU Metadata Grid */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Availability Bucket:</span>
                <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {toy.availability_bucket || 'Standard availability'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Customer App Visibility:</span>
                {toy.visible_to_customers ? (
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Visible
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5 text-slate-400" /> Hidden
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Not Ordered in 6 Months:</span>
                {toy.not_ordered_6mo ? (
                  <span className="flex items-center gap-1 text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Inactive
                  </span>
                ) : (
                  <span className="text-emerald-700 font-medium">Active Demand</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Created On:</span>
                <span className="font-semibold text-slate-700">{formatDate(toy.toy_created_on)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium block mb-1.5">Target Age Groups:</span>
                <AgeGroupChips ageGroups={toy.age_group_labels} />
              </div>
            </div>

            {/* Same toy in other hubs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Same Toy In Other Hubs ({sameToyAcrossHubs.length} locations)
                </h4>
                <span className="text-xs text-slate-500">
                  Total: <strong>{formatNumber(totalAcrossAllHubs)}</strong> units
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {sameToyAcrossHubs.map((otherRow, i) => {
                  const isCurrent = otherRow.library_name === toy.library_name;
                  return (
                    <div
                      key={`${otherRow.library_name}-${i}`}
                      onClick={() => onSelectOtherToy && onSelectOtherToy(otherRow)}
                      className={`p-2.5 rounded-lg text-xs flex items-center justify-between border transition-all ${
                        isCurrent
                          ? 'bg-purple-100/70 border-purple-300 font-semibold'
                          : 'bg-white border-purple-100/80 hover:border-purple-300 hover:bg-purple-50/40 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-purple-700' : 'bg-slate-300'}`} />
                        <span className={isCurrent ? 'text-purple-950 font-bold' : 'text-slate-700 font-medium'}>
                          {otherRow.library_name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-purple-200 text-purple-800 px-1.5 py-0.2 rounded font-bold">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-emerald-700" title="Available">
                          {otherRow.available_stock} Avail
                        </span>
                        <span className="text-purple-700" title="Rented Out">
                          {otherRow.rented_out} Rent
                        </span>
                        {otherRow.damaged_stock > 0 && (
                          <span className="text-amber-600 font-bold" title="Damaged">
                            {otherRow.damaged_stock} Dmg
                          </span>
                        )}
                        <span className="font-extrabold text-slate-900 min-w-[32px] text-right">
                          {otherRow.total_stock}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-purple-100 bg-slate-50 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
