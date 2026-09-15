const AVATAR_PALETTES = [
  { bg: 'bg-purple-100 text-purple-700 border-purple-200', hex: '#7C3AED' },
  { bg: 'bg-amber-100 text-amber-700 border-amber-200', hex: '#D97706' },
  { bg: 'bg-emerald-100 text-emerald-700 border-emerald-200', hex: '#059669' },
  { bg: 'bg-cyan-100 text-cyan-700 border-cyan-200', hex: '#0891B2' },
  { bg: 'bg-rose-100 text-rose-700 border-rose-200', hex: '#E11D48' },
  { bg: 'bg-indigo-100 text-indigo-700 border-indigo-200', hex: '#4F46E5' },
  { bg: 'bg-teal-100 text-teal-700 border-teal-200', hex: '#0D9488' },
  { bg: 'bg-orange-100 text-orange-700 border-orange-200', hex: '#EA580C' },
];

export function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

export function getToyTypeBadge(type: string) {
  switch (type) {
    case 'Big':
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
        color: '#0D9488',
      };
    case 'Toy':
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
        color: '#7C3AED',
      };
    case 'Books':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        color: '#D97706',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        color: '#64748B',
      };
  }
}
