import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseSummaryCSV } from '../summaryParser';
import { parseDetailCSV } from '../detailParser';
import { filterDetailRows } from '../drilldown';

const summaryCSV = fs.readFileSync(path.resolve(__dirname, '../../../public/data/summary.csv'), 'utf-8');
const detailCSV = fs.readFileSync(path.resolve(__dirname, '../../../public/data/detail.csv'), 'utf-8');

describe('Acceptance Criteria & Data Integrity Tests', () => {
  const summary = parseSummaryCSV(summaryCSV);
  const details = parseDetailCSV(detailCSV);

  it('Check 1: Total Stock with All Hubs & All Types equals summary total sum', () => {
    const totalStockSummary = summary.getValue('Total Stock', 'All', 'All');
    expect(totalStockSummary).toBeGreaterThan(0);
    
    // Sum by each hub and each type
    const types = ['Big', 'Toy', 'Books'] as const;
    let manualSum = 0;
    for (const hub of summary.hubs) {
      for (const t of types) {
        manualSum += summary.getValue('Total Stock', t, hub);
      }
    }
    expect(totalStockSummary).toBe(manualSum);
  });

  it('Check 2: Damages -> Toy -> Pune Hub matches in summary and drill-down', () => {
    const summaryVal = summary.getValue('Damages', 'Toy', 'Pune Hub');
    expect(summaryVal).toBeGreaterThan(0);

    const drilldown = filterDetailRows(details, {
      metric: 'Damages',
      type: 'Toy',
      hub: 'Pune Hub',
    });

    expect(drilldown.metricValueColumn).toBe('damaged_stock');
    expect(drilldown.recomputedSum).toBe(summaryVal);
  });

  it('Check 3: Unique SKUs -> Books -> Ahmedabad HUB shows exactly 134 rows', () => {
    const summaryVal = summary.getValue('Unique SKUs', 'Books', 'Ahmedabad HUB');
    expect(summaryVal).toBe(134);

    const drilldown = filterDetailRows(details, {
      metric: 'Unique SKUs',
      type: 'Books',
      hub: 'Ahmedabad HUB',
    });

    expect(drilldown.rows.length).toBe(134);
    expect(drilldown.recomputedSum).toBe(134);
  });

  it('Check 4: Age Group 8-12 years -> Big -> Andheri Hub - Mumbai shows only matching age group rows', () => {
    const drilldown = filterDetailRows(details, {
      metric: 'Age Group 8-12 years',
      type: 'Big',
      hub: 'Andheri Hub - Mumbai',
    });

    expect(drilldown.rows.length).toBeGreaterThan(0);
    for (const row of drilldown.rows) {
      expect(row.library_name).toBe('Andheri Hub - Mumbai');
      expect(row.toy_type).toBe('Big');
      expect(row.age_group_labels).toContain('8-12 years');
    }
  });

  it('Check 5: Invariant Total Stock = Rented Out + Available + Damages holds for all hubs', () => {
    const types = ['Big', 'Toy', 'Books'] as const;
    for (const hub of summary.hubs) {
      for (const t of types) {
        const inv = summary.checkInvariant(hub, t);
        expect(inv.isValid).toBe(true);
      }
    }
  });

  it('Check 6: Correct parsing of booleans and arrays in detail rows', () => {
    expect(details.length).toBeGreaterThan(10000);
    const firstRow = details[0];
    expect(typeof firstRow.visible_to_customers).toBe('boolean');
    expect(typeof firstRow.not_ordered_6mo).toBe('boolean');
    expect(Array.isArray(firstRow.age_group_labels)).toBe(true);
    expect(typeof firstRow.total_stock).toBe('number');
  });
});
