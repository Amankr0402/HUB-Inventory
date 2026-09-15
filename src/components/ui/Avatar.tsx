import React from 'react';

interface AvatarProps {
  initials: string;
  color?: string; // hex or bg class
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  initials,
  color = '#7C3AED',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};
