import React from 'react';
import { getToyTypeBadge } from '../../utils/colors';

export const ToyTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const badge = getToyTypeBadge(type);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      {type}
    </span>
  );
};

export const AgeGroupChips: React.FC<{ ageGroups: string[] }> = ({ ageGroups }) => {
  if (!ageGroups || ageGroups.length === 0) {
    return <span className="text-xs text-slate-400">None</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {ageGroups.map((ag) => (
        <span
          key={ag}
          className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-100"
        >
          {ag}
        </span>
      ))}
    </div>
  );
};
