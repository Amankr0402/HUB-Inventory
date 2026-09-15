import Papa from 'papaparse';
import type { RawSummaryRow, SummaryMatrix, ToyType } from '../types';

export function parseSummaryCSV(csvText: string): SummaryMatrix {
  const parsed = Papa.parse<RawSummaryRow>(csvText.trim(), {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  const headers = parsed.meta.fields || [];
  const toyTypeIndex = headers.indexOf('toy_type');
  
  // All columns after toy_type are dynamic hub columns
  const hubs = headers.slice(toyTypeIndex + 1).filter(Boolean);

  const dataMap = new Map<string, number>();
  const rowLabelsSet = new Set<string>();
  const toyTypesSet = new Set<string>();

  for (const row of parsed.data) {
    const rowLabel = (row.row_label || '').trim();
    const toyType = (row.toy_type || '').trim();
    
    if (rowLabel) {
      rowLabelsSet.add(rowLabel);
    }
    if (toyType) {
      toyTypesSet.add(toyType);
    }

    for (const hub of hubs) {
      const val = row[hub];
      const numVal = typeof val === 'number' ? val : (val ? Number(val) : 0) || 0;
      // Key format: metric::toy_type::hub
      const key = `${rowLabel}::${toyType}::${hub}`;
      dataMap.set(key, numVal);
    }
  }

  const standardToyTypes: ToyType[] = ['Big', 'Toy', 'Books'];

  const getValue = (metric: string, toyType: ToyType, hub: string): number => {
    // Single hub + single toy type
    if (hub !== 'All' && toyType !== 'All') {
      const key = `${metric}::${toyType}::${hub}`;
      return dataMap.get(key) || 0;
    }

    // Single hub + All toy types
    if (hub !== 'All' && toyType === 'All') {
      if (metric === 'Active Subscribers') {
        // Active Subscribers has empty toy_type
        return dataMap.get(`Active Subscribers::::${hub}`) || 0;
      }
      return standardToyTypes.reduce((sum, tt) => {
        return sum + (dataMap.get(`${metric}::${tt}::${hub}`) || 0);
      }, 0);
    }

    // All hubs + Single toy type
    if (hub === 'All' && toyType !== 'All') {
      return hubs.reduce((sum, h) => {
        return sum + (dataMap.get(`${metric}::${toyType}::${h}`) || 0);
      }, 0);
    }

    // All hubs + All toy types
    if (metric === 'Active Subscribers') {
      return hubs.reduce((sum, h) => {
        return sum + (dataMap.get(`Active Subscribers::::${h}`) || 0);
      }, 0);
    }

    return hubs.reduce((hubSum, h) => {
      const typeSum = standardToyTypes.reduce((ttSum, tt) => {
        return ttSum + (dataMap.get(`${metric}::${tt}::${h}`) || 0);
      }, 0);
      return hubSum + typeSum;
    }, 0);
  };

  const getHubSubscribers = (hub: string): number => {
    if (hub === 'All') {
      return getTotalSubscribers();
    }
    return dataMap.get(`Active Subscribers::::${hub}`) || 0;
  };

  const getTotalSubscribers = (): number => {
    return hubs.reduce((sum, h) => sum + (dataMap.get(`Active Subscribers::::${h}`) || 0), 0);
  };

  const checkInvariant = (hub: string, toyType: ToyType) => {
    const total = getValue('Total Stock', toyType, hub);
    const rented = getValue('Rented Out', toyType, hub);
    const available = getValue('Available', toyType, hub);
    const damages = getValue('Damages', toyType, hub);
    const sum = rented + available + damages;
    const diff = Math.abs(total - sum);
    return {
      total,
      sum,
      diff,
      isValid: diff === 0,
    };
  };

  return {
    hubs,
    rowLabels: Array.from(rowLabelsSet),
    toyTypes: Array.from(toyTypesSet),
    getValue,
    getHubSubscribers,
    getTotalSubscribers,
    checkInvariant,
  };
}
