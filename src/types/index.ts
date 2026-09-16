export type ToyType = 'Big' | 'Toy' | 'Books' | 'All';

export type MetricType = 
  | 'Total Stock'
  | 'Rented Out'
  | 'Available'
  | 'Damages'
  | 'Unique SKUs'
  | 'Visible to Customers'
  | 'Not Ordered in 6mo'
  | 'Active Subscribers'
  | string;

export interface RawSummaryRow {
  row_label: string;
  toy_type: string;
  [hubName: string]: string | number;
}

export interface SummaryMatrix {
  hubs: string[];
  rowLabels: string[];
  toyTypes: string[];
  getValue: (metric: string, toyType: ToyType, hub: string) => number;
  getHubSubscribers: (hub: string) => number;
  getTotalSubscribers: () => number;
  checkInvariant: (hub: string, toyType: ToyType) => {
    total: number;
    sum: number;
    diff: number;
    isValid: boolean;
  };
}

export interface RawDetailRow {
  library_name: string;
  toy_name: string;
  toy_type: string;
  toy_created_on: string;
  age_group_labels: string;
  total_stock: string | number;
  available_stock: string | number;
  damaged_stock: string | number;
  rented_out: string | number;
  visible_to_customers: string | boolean;
  availability_bucket: string;
  not_ordered_6mo: string | boolean;
}

export interface DetailRow {
  library_name: string;
  toy_name: string;
  toy_type: 'Big' | 'Toy' | 'Books';
  toy_created_on: string;
  age_group_labels: string[];
  total_stock: number;
  available_stock: number;
  damaged_stock: number;
  rented_out: number;
  visible_to_customers: boolean;
  availability_bucket: string;
  not_ordered_6mo: boolean;
}

export interface HubSummary {
  hub: string;
  subscribers: number;
  totalStock: number;
  rentedOut: number;
  available: number;
  damages: number;
  uniqueSkus: number;
  utilisationRate: number; // 0-100%
  damageRate: number; // 0-100%
  stockPerSubscriber: number;
  invariantValid: boolean;
}

export interface StockOverviewStats {
  totalStock: number;
  rentedOut: number;
  available: number;
  damages: number;
  uniqueSkus: number;
  visibleToCustomers: number;
  notOrdered6mo: number;
  activeSubscribers: number;
  utilisationRate: number;
  damageRate: number;
  stockPerSubscriber: number;
  hubCount: number;
  invariantValid: boolean;
}

export interface TopHubItem {
  hub: string;
  value: number; // rate in %
  numerator: number;
  denominator: number;
  initials: string;
  color: string;
}

export interface HubDamageItem {
  hub: string;
  damages: number;
  damageBig: number;
  damageToy: number;
  damageBooks: number;
  totalStock: number;
  damageRate: number;
  initials: string;
  color: string;
}

export interface ChartBucketItem {
  label: string;
  count: number;
  percentage: number;
}

export interface DrilldownFilterState {
  search: string;
  hubs: string[];
  toyType: ToyType;
  ageGroups: string[];
  visibleOnly: boolean;
  availabilityBucket: string;
  notOrderedOnly?: boolean;
}

export interface DrilldownParams {
  metric: string;
  type: ToyType;
  hub: string;
}
