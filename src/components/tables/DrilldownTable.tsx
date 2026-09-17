import React, { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import type { DetailRow } from '../../types';
import { formatNumber, formatDate } from '../../utils/format';
import { ToyTypeBadge, AgeGroupChips } from '../ui/Badge';

export const METABASE_DAMAGE_REPORT_URL = 'https://metabase-bkp.theelefant.ai/public/question/5eaf029f-c395-429b-a3b2-8557391d0dc9';
export const METABASE_DAMAGE_CSV_URL = 'https://metabase-bkp.theelefant.ai/public/question/5eaf029f-c395-429b-a3b2-8557391d0dc9.csv';

interface DrilldownTableProps {
  rows: DetailRow[];
  metricValueColumn?: 'total_stock' | 'rented_out' | 'available_stock' | 'damaged_stock' | 'count';
  metricName?: string;
  highlightRowId?: string;
  onRowClick?: (row: DetailRow) => void;
}

export const DrilldownTable: React.FC<DrilldownTableProps> = ({
  rows,
  metricValueColumn = 'total_stock',
  metricName,
  onRowClick,
}) => {
  const defaultSortId = useMemo(() => {
    if (metricValueColumn === 'damaged_stock') return 'damaged_stock';
    if (metricValueColumn === 'rented_out') return 'rented_out';
    if (metricValueColumn === 'available_stock') return 'available_stock';
    return 'total_stock';
  }, [metricValueColumn]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: defaultSortId, desc: true },
  ]);

  const columns = useMemo<ColumnDef<DetailRow>[]>(
    () => [
      {
        accessorKey: 'library_name',
        header: 'Hub / Library',
        cell: (info) => (
          <span className="font-semibold text-slate-800">{info.getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'toy_name',
        header: 'SKU Name',
        cell: (info) => (
          <span className="font-medium text-purple-900 group-hover:text-purple-700">
            {info.getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'toy_type',
        header: 'Type',
        cell: (info) => <ToyTypeBadge type={info.getValue() as string} />,
      },
      {
        accessorKey: 'age_group_labels',
        header: 'Age Groups',
        cell: (info) => <AgeGroupChips ageGroups={info.getValue() as string[]} />,
        enableSorting: false,
      },
      {
        accessorKey: 'total_stock',
        header: 'Total',
        cell: (info) => (
          <span className="font-semibold text-slate-900">{formatNumber(info.getValue() as number)}</span>
        ),
      },
      {
        accessorKey: 'available_stock',
        header: 'Available',
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <span className={val > 0 ? 'font-bold text-emerald-600' : 'text-slate-400'}>
              {formatNumber(val)}
            </span>
          );
        },
      },
      {
        accessorKey: 'rented_out',
        header: 'Rented',
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <span className={val > 0 ? 'font-bold text-purple-600' : 'text-slate-400'}>
              {formatNumber(val)}
            </span>
          );
        },
      },
      {
        accessorKey: 'damaged_stock',
        header: 'Damages',
        cell: (info) => {
          const val = info.getValue() as number;
          return (
            <span className={val > 0 ? 'font-bold text-amber-600' : 'text-slate-400'}>
              {formatNumber(val)}
            </span>
          );
        },
      },
      {
        accessorKey: 'visible_to_customers',
        header: 'Visible',
        cell: (info) => {
          const isVis = info.getValue() as boolean;
          return isVis ? (
            <span title="Visible"><CheckCircle2 className="w-4 h-4 text-emerald-600 inline-block" /></span>
          ) : (
            <span title="Hidden"><XCircle className="w-4 h-4 text-slate-300 inline-block" /></span>
          );
        },
      },
      {
        accessorKey: 'availability_bucket',
        header: 'Availability',
        cell: (info) => {
          const val = info.getValue() as string;
          return val ? (
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap">
              {val}
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          );
        },
      },
      {
        accessorKey: 'not_ordered_6mo',
        header: 'Not Ordered 6m',
        cell: (info) => {
          const isNot = info.getValue() as boolean;
          return isNot ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 whitespace-nowrap">
              <AlertCircle className="w-3 h-3 text-amber-600" /> Inactive
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">—</span>
          );
        },
      },
      {
        accessorKey: 'toy_created_on',
        header: 'Created On',
        cell: (info) => (
          <span className="text-slate-500 text-[11px] whitespace-nowrap">
            {formatDate(info.getValue() as string)}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

  const isDamages = metricValueColumn === 'damaged_stock' || metricName === 'Damages';

  const exportFilteredCSV = () => {
    if (!rows.length) return;
    const headers = [
      'Toy Name',
      'Hub / Library',
      'Toy Type',
      'Age Groups',
      'Total Stock',
      'Available Stock',
      'Rented Out',
      'Damaged Stock',
      'Visible To Customers',
      'Availability Bucket',
      'Not Ordered 6mo',
      'Created On',
    ];

    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.toy_name.replace(/"/g, '""')}"`,
        `"${r.library_name.replace(/"/g, '""')}"`,
        `"${r.toy_type}"`,
        `"${r.age_group_labels.join(' | ')}"`,
        r.total_stock,
        r.available_stock,
        r.rented_out,
        r.damaged_stock,
        r.visible_to_customers,
        `"${r.availability_bucket}"`,
        r.not_ordered_6mo,
        `"${r.toy_created_on}"`,
      ].join(',');
      csvLines.push(line);
    }

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `the_elefant_${isDamages ? 'damages' : 'inventory'}_drilldown_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleMetabaseDamageExport = () => {
    window.open(METABASE_DAMAGE_CSV_URL, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* Action Bar: Count & CSV Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-600 font-medium">
          Showing <strong className="text-slate-900">{formatNumber(rows.length)}</strong> matching toys
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isDamages ? (
            <>
              {/* Direct Link to Metabase Interactive Report */}
              <a
                href={METABASE_DAMAGE_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-800 font-semibold shadow-2xs transition-colors"
                title="Open live interactive Metabase report in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
                <span>Open Live Metabase Report</span>
              </a>

              {/* Primary Metabase Damage CSV Export */}
              <button
                onClick={handleMetabaseDamageExport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm transition-colors"
                title="Export live Metabase damage records as CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Damage CSV (Metabase)</span>
              </button>

              {/* Local Filtered Table Export */}
              <button
                onClick={exportFilteredCSV}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 font-medium transition-colors"
                title="Export currently filtered table rows as CSV"
              >
                <span>Export Filtered Table</span>
              </button>
            </>
          ) : (
            <button
              onClick={exportFilteredCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-purple-200 hover:border-purple-400 text-purple-700 font-semibold shadow-sm hover:bg-purple-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* TanStack Table Container with Sticky Header */}
      <div className="overflow-x-auto rounded-xl border border-purple-100 shadow-sm bg-white max-h-[560px] overflow-y-auto">
        <table className="w-full text-left border-collapse text-xs relative">
          <thead className="sticky top-0 z-10 bg-[#F5F0FF] shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-purple-200/80">
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className={`py-3 px-3.5 font-bold text-slate-700 select-none ${
                        isSortable ? 'cursor-pointer hover:text-purple-700 transition-colors' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {isSortable && (
                          <span>
                            {sortDirection === 'asc' ? (
                              <ArrowUp className="w-3 h-3 text-purple-600" />
                            ) : sortDirection === 'desc' ? (
                              <ArrowDown className="w-3 h-3 text-purple-600" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-slate-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-purple-50">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-slate-400 text-sm"
                >
                  No toys match the selected criteria.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className="hover:bg-purple-50/50 cursor-pointer group transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-2.5 px-3.5 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="border border-purple-200 rounded-lg px-2 py-1 bg-white text-xs text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-purple-400"
          >
            {[25, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>
            Page <strong className="text-slate-900">{table.getState().pagination.pageIndex + 1}</strong> of{' '}
            <strong className="text-slate-900">{table.getPageCount() || 1}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="First page"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Last page"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
