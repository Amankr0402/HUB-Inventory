import React from 'react';

export const PatternBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#EEE9FB] overflow-x-hidden">
      {/* Repeating SVG Toy Pattern Background */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.065] print:hidden"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%238B7AD1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3C!-- Star --%3E%3Cpath d='M20 10 L23 18 L32 19 L25 25 L27 34 L20 29 L13 34 L15 25 L8 19 L17 18 Z' /%3E%3C!-- Toy Block --%3E%3Crect x='75' y='15' width='22' height='22' rx='3' /%3E%3Cpath d='M75 15 L86 26 L97 15' /%3E%3Cpath d='M86 26 L86 37' /%3E%3C!-- Rocking Horse --%3E%3Cpath d='M15 85 Q28 95 45 85 M20 80 L25 65 L33 65 L38 80 M28 65 L26 55 L35 55' /%3E%3C!-- Ball --%3E%3Ccircle cx='90' cy='85' r='14' /%3E%3Cpath d='M78 80 Q90 88 102 80 M82 92 Q90 85 98 92' /%3E%3C!-- Robot Head --%3E%3Crect x='48' y='45' width='20' height='18' rx='2' /%3E%3Ccircle cx='54' cy='52' r='1.5' fill='%238B7AD1' /%3E%3Ccircle cx='62' cy='52' r='1.5' fill='%238B7AD1' /%3E%3Cpath d='M54 58 L62 58' /%3E%3Cpath d='M58 45 L58 40 M56 40 L60 40' /%3E%3C/g%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '120px 120px',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
