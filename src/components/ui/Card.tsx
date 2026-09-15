import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  topBorderColor?: string; // hex or tailwind class
  hoverLift?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  topBorderColor,
  hoverLift = false,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={topBorderColor ? { borderTopColor: topBorderColor, borderTopWidth: '4px' } : undefined}
      className={`bg-white rounded-2xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(109,40,217,0.06)] border border-purple-100/40 relative transition-all ${
        hoverLift ? 'hover:shadow-[0_8px_28px_rgba(109,40,217,0.1)] hover:-translate-y-0.5' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
