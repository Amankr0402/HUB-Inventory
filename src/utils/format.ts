/**
 * Indian digit grouping (e.g., 1,23,456)
 */
const indianNumberFormatter = new Intl.NumberFormat('en-IN');

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return indianNumberFormatter.format(Math.round(num));
}

export function formatDecimal(num: number | null | undefined, decimals = 1): string {
  if (num === null || num === undefined || isNaN(num)) return '0.0';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(rate: number | null | undefined, decimals = 1): string {
  if (rate === null || rate === undefined || isNaN(rate)) return '0.0%';
  return `${(rate * 100).toFixed(decimals)}%`;
}

export function getInitials(name: string): string {
  if (!name) return '??';
  const clean = name.replace(/^(the\s+|theEleFant\s+)/i, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
