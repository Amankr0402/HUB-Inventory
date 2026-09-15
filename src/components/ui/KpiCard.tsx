import React from 'react';
import { Card } from './Card';
import { ArrowUpRight, AlertTriangle } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  caption?: React.ReactNode;
  topBorderColor: string; // e.g. '#059669', '#7C3AED', '#0891B2', '#EA580C', '#F59E0B'
  valueColor?: string;
  icon?: React.ReactNode;
  warning?: boolean;
  warningText?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  caption,
  topBorderColor,
  valueColor,
  icon,
  warning = false,
  warningText,
  onClick,
}) => {
  const color = valueColor || topBorderColor;

  return (
    <Card
      topBorderColor={topBorderColor}
      hoverLift={Boolean(onClick)}
      onClick={onClick}
      className={`relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        <div className="flex items-center gap-1">
          {warning && (
            <span
              className="text-amber-500 p-0.5"
              title={warningText || 'Invariant discrepancy detected'}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
            </span>
          )}
          {onClick && (
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
          )}
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
      </div>

      <div className="mt-2 mb-1.5 flex items-baseline">
        <div
          className="text-3xl sm:text-[34px] font-extrabold tracking-tight leading-none"
          style={{ color }}
        >
          {value}
        </div>
      </div>

      {caption && (
        <div className="text-xs sm:text-[13px] text-slate-500 font-medium">
          {caption}
        </div>
      )}
    </Card>
  );
};
