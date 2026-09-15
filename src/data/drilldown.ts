import type { DetailRow, DrilldownFilterState, DrilldownParams } from '../types';

export interface DrilldownResult {
  rows: DetailRow[];
  metricValueColumn: 'total_stock' | 'rented_out' | 'available_stock' | 'damaged_stock' | 'count';
  recomputedSum: number;
}

export function getMetricFilterRule(metric: string): {
  filterFn: (row: DetailRow) => boolean;
  valueColumn: 'total_stock' | 'rented_out' | 'available_stock' | 'damaged_stock' | 'count';
} {
  const normMetric = (metric || '').trim();

  if (normMetric === 'Total Stock') {
    return {
      filterFn: (row) => row.total_stock > 0,
      valueColumn: 'total_stock',
    };
  }

  if (normMetric === 'Rented Out') {
    return {
      filterFn: (row) => row.rented_out > 0,
      valueColumn: 'rented_out',
    };
  }

  if (normMetric === 'Available') {
    return {
      filterFn: (row) => row.available_stock > 0,
      valueColumn: 'available_stock',
    };
  }

  if (normMetric === 'Damages') {
    return {
      filterFn: (row) => row.damaged_stock > 0,
      valueColumn: 'damaged_stock',
    };
  }

  if (normMetric === 'Unique SKUs') {
    return {
      filterFn: () => true,
      valueColumn: 'count',
    };
  }

  if (normMetric === 'Visible to Customers') {
    return {
      filterFn: (row) => row.visible_to_customers === true,
      valueColumn: 'count',
    };
  }

  if (normMetric === 'Not Ordered in 6mo') {
    return {
      filterFn: (row) => row.not_ordered_6mo === true,
      valueColumn: 'count',
    };
  }

  if (normMetric.startsWith('Available in ')) {
    return {
      filterFn: (row) => row.availability_bucket === normMetric,
      valueColumn: 'count',
    };
  }

  if (normMetric.startsWith('Age Group ')) {
    const targetAge = normMetric.replace('Age Group ', '').trim();
    return {
      filterFn: (row) => row.age_group_labels.some((ag) => ag.trim() === targetAge || ag.trim() === normMetric),
      valueColumn: 'count',
    };
  }

  // Handle direct age group name passed from chart (e.g. "0-1 years")
  if (/^\d+-\d+\s+years$/.test(normMetric)) {
    return {
      filterFn: (row) => row.age_group_labels.some((ag) => ag.trim() === normMetric),
      valueColumn: 'count',
    };
  }

  // Fallback
  return {
    filterFn: () => true,
    valueColumn: 'count',
  };
}

export function filterDetailRows(
  allRows: DetailRow[],
  params: DrilldownParams,
  extraFilters?: Partial<DrilldownFilterState>
): DrilldownResult {
  const { metric, type, hub } = params;
  const { filterFn, valueColumn } = getMetricFilterRule(metric);

  const filtered = allRows.filter((row) => {
    // 1. Hub filter
    if (hub && hub !== 'All') {
      if (row.library_name !== hub) return false;
    } else if (extraFilters?.hubs && extraFilters.hubs.length > 0) {
      if (!extraFilters.hubs.includes(row.library_name)) return false;
    }

    // 2. Toy type filter
    const activeType = (extraFilters?.toyType && extraFilters.toyType !== 'All') ? extraFilters.toyType : type;
    if (activeType && activeType !== 'All') {
      if (row.toy_type !== activeType) return false;
    }

    // 3. Metric-specific filter
    if (!filterFn(row)) return false;

    // 4. Extra Search filter
    if (extraFilters?.search) {
      const q = extraFilters.search.toLowerCase();
      const matchName = row.toy_name.toLowerCase().includes(q);
      const matchHub = row.library_name.toLowerCase().includes(q);
      if (!matchName && !matchHub) return false;
    }

    // 5. Extra Age groups filter
    if (extraFilters?.ageGroups && extraFilters.ageGroups.length > 0) {
      const hasAnyAge = extraFilters.ageGroups.some((ag) => row.age_group_labels.includes(ag));
      if (!hasAnyAge) return false;
    }

    // 6. Extra Visible Only filter
    if (extraFilters?.visibleOnly) {
      if (!row.visible_to_customers) return false;
    }

    // 7. Extra Availability Bucket filter
    if (extraFilters?.availabilityBucket && extraFilters.availabilityBucket !== 'All') {
      if (row.availability_bucket !== extraFilters.availabilityBucket) return false;
    }

    // 8. Extra Not Ordered 6mo filter
    if (extraFilters?.notOrderedOnly) {
      if (!row.not_ordered_6mo) return false;
    }

    return true;
  });

  // Calculate recomputed total sum
  let recomputedSum = 0;
  if (valueColumn === 'total_stock') {
    recomputedSum = filtered.reduce((sum, r) => sum + r.total_stock, 0);
  } else if (valueColumn === 'rented_out') {
    recomputedSum = filtered.reduce((sum, r) => sum + r.rented_out, 0);
  } else if (valueColumn === 'available_stock') {
    recomputedSum = filtered.reduce((sum, r) => sum + r.available_stock, 0);
  } else if (valueColumn === 'damaged_stock') {
    recomputedSum = filtered.reduce((sum, r) => sum + r.damaged_stock, 0);
  } else {
    // Unique SKUs / Count
    recomputedSum = filtered.length;
  }

  return {
    rows: filtered,
    metricValueColumn: valueColumn,
    recomputedSum,
  };
}
