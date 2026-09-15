import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface MetricTileProps {
  label: string;
  value: string | number;
  caption?: string;
  dotColor?: string; // hex
  variant?: 'default' | 'warning';
  onClick?: () => void;
  className?: string;
}

export const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  caption,
  dotColor = '#7C3AED',
  variant = 'default',
  onClick,
  className = '',
}) => {
  const isWarning = variant === 'warning';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-3.5 transition-all duration-150 relative group select-none ${
        isWarning
          ? 'bg-[#FFF8E7] border border-[#FDE9B6] hover:border-amber-400 hover:shadow-sm'
          : 'bg-[#F5F0FF] border border-[#E4DAFF] hover:border-[#C4B5FD] hover:shadow-sm'
      } ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: isWarning ? '#EA580C' : dotColor }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 truncate">
            {label}
          </span>
        </div>
        {onClick && (
          <ArrowUpRight
            className={`w-3.5 h-3.5 transition-colors shrink-0 ${
              isWarning
                ? 'text-amber-500 group-hover:text-amber-700'
                : 'text-purple-400 group-hover:text-purple-700'
            }`}
          />
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`text-xl font-bold tracking-tight ${
            isWarning ? 'text-amber-900' : 'text-slate-900'
          }`}
        >
          {value}
        </span>
        {caption && (
          <span className="text-[11px] text-slate-500 font-medium truncate">
            {caption}
          </span>
        )}
      </div>
    </div>
  );
};
