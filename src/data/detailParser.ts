import Papa from 'papaparse';
import type { DetailRow, RawDetailRow } from '../types';

export function parseDetailCSV(csvText: string): DetailRow[] {
  const parsed = Papa.parse<RawDetailRow>(csvText.trim(), {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  return parsed.data.map((row) => {
    // Parse pipe separated age group labels
    const rawAge = typeof row.age_group_labels === 'string' ? row.age_group_labels : '';
    const age_group_labels = rawAge
      ? rawAge.split('|').map((s) => s.trim()).filter(Boolean)
      : [];

    // Parse booleans
    const visible_to_customers =
      row.visible_to_customers === true ||
      String(row.visible_to_customers).trim().toLowerCase() === 'true';

    const not_ordered_6mo =
      row.not_ordered_6mo === true ||
      String(row.not_ordered_6mo).trim().toLowerCase() === 'true';

    const total_stock = typeof row.total_stock === 'number' ? row.total_stock : Number(row.total_stock) || 0;
    const available_stock = typeof row.available_stock === 'number' ? row.available_stock : Number(row.available_stock) || 0;
    const damaged_stock = typeof row.damaged_stock === 'number' ? row.damaged_stock : Number(row.damaged_stock) || 0;
    const rented_out = typeof row.rented_out === 'number' ? row.rented_out : Number(row.rented_out) || 0;

    return {
      library_name: (row.library_name || '').trim(),
      toy_name: (row.toy_name || '').trim(),
      toy_type: (row.toy_type || 'Toy').trim() as 'Big' | 'Toy' | 'Books',
      toy_created_on: (row.toy_created_on || '').trim(),
      age_group_labels,
      total_stock,
      available_stock,
      damaged_stock,
      rented_out,
      visible_to_customers,
      availability_bucket: (row.availability_bucket || '').trim(),
      not_ordered_6mo,
    };
  });
}
