import type {
  ChartBucketItem,
  DetailRow,
  HubSummary,
  StockOverviewStats,
  SummaryMatrix,
  TopHubItem,
  ToyType,
} from '../types';
import { getAvatarColor } from '../utils/colors';
import { getInitials as computeInitials } from '../utils/format';

export function getStockOverviewStats(
  summary: SummaryMatrix,
  selectedHub: string,
  selectedType: ToyType
): StockOverviewStats {
  const totalStock = summary.getValue('Total Stock', selectedType, selectedHub);
  const rentedOut = summary.getValue('Rented Out', selectedType, selectedHub);
  const available = summary.getValue('Available', selectedType, selectedHub);
  const damages = summary.getValue('Damages', selectedType, selectedHub);
  const uniqueSkus = summary.getValue('Unique SKUs', selectedType, selectedHub);
  const visibleToCustomers = summary.getValue('Visible to Customers', selectedType, selectedHub);
  const notOrdered6mo = summary.getValue('Not Ordered in 6mo', selectedType, selectedHub);
  const activeSubscribers = summary.getHubSubscribers(selectedHub);

  const utilisationRate = totalStock > 0 ? rentedOut / totalStock : 0;
  const damageRate = totalStock > 0 ? damages / totalStock : 0;
  const stockPerSubscriber = activeSubscribers > 0 ? totalStock / activeSubscribers : 0;
  const invariant = summary.checkInvariant(selectedHub, selectedType);
  const hubCount = selectedHub === 'All' ? summary.hubs.length : 1;

  return {
    totalStock,
    rentedOut,
    available,
    damages,
    uniqueSkus,
    visibleToCustomers,
    notOrdered6mo,
    activeSubscribers,
    utilisationRate,
    damageRate,
    stockPerSubscriber,
    hubCount,
    invariantValid: invariant.isValid,
  };
}

export function getHubSummaries(
  summary: SummaryMatrix,
  selectedType: ToyType
): HubSummary[] {
  return summary.hubs.map((hub) => {
    const subscribers = summary.getHubSubscribers(hub);
    const totalStock = summary.getValue('Total Stock', selectedType, hub);
    const rentedOut = summary.getValue('Rented Out', selectedType, hub);
    const available = summary.getValue('Available', selectedType, hub);
    const damages = summary.getValue('Damages', selectedType, hub);
    const uniqueSkus = summary.getValue('Unique SKUs', selectedType, hub);

    const utilisationRate = totalStock > 0 ? rentedOut / totalStock : 0;
    const damageRate = totalStock > 0 ? damages / totalStock : 0;
    const stockPerSubscriber = subscribers > 0 ? totalStock / subscribers : 0;
    const invariant = summary.checkInvariant(hub, selectedType);

    return {
      hub,
      subscribers,
      totalStock,
      rentedOut,
      available,
      damages,
      uniqueSkus,
      utilisationRate,
      damageRate,
      stockPerSubscriber,
      invariantValid: invariant.isValid,
    };
  });
}

export function getTopHubsByUtilisation(
  summaries: HubSummary[],
  count: number = 5
): TopHubItem[] {
  return [...summaries]
    .filter((h) => h.totalStock > 0)
    .sort((a, b) => b.utilisationRate - a.utilisationRate)
    .slice(0, count)
    .map((h) => {
      const initials = computeInitials(h.hub);
      const colorObj = getAvatarColor(h.hub);
      return {
        hub: h.hub,
        value: h.utilisationRate,
        numerator: h.rentedOut,
        denominator: h.totalStock,
        initials,
        color: colorObj.hex,
      };
    });
}

export function getTopHubsByDamages(
  summaries: HubSummary[],
  count: number = 5
): TopHubItem[] {
  return [...summaries]
    .filter((h) => h.totalStock > 0)
    .sort((a, b) => b.damageRate - a.damageRate)
    .slice(0, count)
    .map((h) => {
      const initials = computeInitials(h.hub);
      const colorObj = getAvatarColor(h.hub);
      return {
        hub: h.hub,
        value: h.damageRate,
        numerator: h.damages,
        denominator: h.totalStock,
        initials,
        color: colorObj.hex,
      };
    });
}

export function getAvailabilityBuckets(
  detailRows: DetailRow[],
  hub: string,
  toyType: ToyType
): ChartBucketItem[] {
  const filtered = detailRows.filter((r) => {
    if (hub !== 'All' && r.library_name !== hub) return false;
    if (toyType !== 'All' && r.toy_type !== toyType) return false;
    return Boolean(r.availability_bucket);
  });

  const bucketCounts = new Map<string, number>();
  for (const row of filtered) {
    const b = row.availability_bucket;
    bucketCounts.set(b, (bucketCounts.get(b) || 0) + 1);
  }

  // Define preferred ordering
  const preferredOrder = [
    'Available in 1-3 Days',
    'Available in 7-8 Days',
    'Available in 9-12 Days',
    'Available in 10-12 Days',
    'Available in 11-13 Days',
    'Available in 12-14 Days',
    'Available in 13-15 Days',
    'Available in 16-18 Days',
    'Available in 17-18 Days',
    'Available in 18-18 Days',
  ];

  const total = filtered.length || 1;
  const result: ChartBucketItem[] = [];

  for (const key of preferredOrder) {
    if (bucketCounts.has(key)) {
      const count = bucketCounts.get(key) || 0;
      result.push({
        label: key,
        count,
        percentage: (count / total) * 100,
      });
      bucketCounts.delete(key);
    }
  }

  // Any remaining buckets
  for (const [key, count] of bucketCounts.entries()) {
    result.push({
      label: key,
      count,
      percentage: (count / total) * 100,
    });
  }

  return result;
}

export function getAgeGroupCoverage(
  detailRows: DetailRow[],
  hub: string,
  toyType: ToyType
): ChartBucketItem[] {
  const filtered = detailRows.filter((r) => {
    if (hub !== 'All' && r.library_name !== hub) return false;
    if (toyType !== 'All' && r.toy_type !== toyType) return false;
    return r.age_group_labels && r.age_group_labels.length > 0;
  });

  const standardAges = [
    '0-1 years',
    '1-3 years',
    '3-5 years',
    '5-8 years',
    '8-12 years',
  ];

  const counts = new Map<string, number>();
  standardAges.forEach((ag) => counts.set(ag, 0));

  for (const row of filtered) {
    for (const ag of row.age_group_labels) {
      const trimmed = ag.trim();
      counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
    }
  }

  const total = filtered.length || 1;
  return standardAges.map((ag) => {
    const count = counts.get(ag) || 0;
    return {
      label: ag,
      count,
      percentage: (count / total) * 100,
    };
  });
}

export function getToyTypeBreakdown(summary: SummaryMatrix, hub: string) {
  const types: ToyType[] = ['Big', 'Toy', 'Books'];
  return types.map((tt) => {
    const total = summary.getValue('Total Stock', tt, hub);
    const rented = summary.getValue('Rented Out', tt, hub);
    const available = summary.getValue('Available', tt, hub);
    const damages = summary.getValue('Damages', tt, hub);
    const uniqueSkus = summary.getValue('Unique SKUs', tt, hub);
    const utilisationRate = total > 0 ? rented / total : 0;
    const damageRate = total > 0 ? damages / total : 0;

    return {
      type: tt,
      total,
      rented,
      available,
      damages,
      uniqueSkus,
      utilisationRate,
      damageRate,
    };
  });
}
