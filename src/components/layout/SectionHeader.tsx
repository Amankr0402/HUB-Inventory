import React from 'react';

interface SectionHeaderProps {
  title: string;
  emoji?: string;
  badge?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  emoji,
  badge,
  action,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-base leading-none">{emoji}</span>}
          <h2 className="text-[12.5px] font-semibold uppercase tracking-widest text-[#6B7280]">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 tracking-normal">
              {badge}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {/* Thin light-purple hairline */}
      <div className="h-[1px] w-full bg-purple-200/70" />
    </div>
  );
};
