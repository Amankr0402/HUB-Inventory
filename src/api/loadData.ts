import type { DetailRow, SummaryMatrix } from '../types';
import { parseSummaryCSV } from '../data/summaryParser';
import { parseDetailCSV } from '../data/detailParser';

export interface LoadedDataResult {
  summaryMatrix: SummaryMatrix;
  detailRows: DetailRow[];
  isCachedFallback: boolean;
  dataTimestamp: string;
}

const SUMMARY_LIVE_URL = 'https://metabase-bkp.theelefant.ai/public/question/4288db2b-326f-4e4b-9740-0d2446c827c1.csv';
const DETAIL_LIVE_URL = 'https://metabase-bkp.theelefant.ai/public/question/c1fe3252-e3b1-4117-959c-aa37271cf059.csv';

const SUMMARY_PROXY_URL = '/metabase/public/question/4288db2b-326f-4e4b-9740-0d2446c827c1.csv';
const DETAIL_PROXY_URL = '/metabase/public/question/c1fe3252-e3b1-4117-959c-aa37271cf059.csv';

const SUMMARY_FALLBACK_URL = '/data/summary.csv';
const DETAIL_FALLBACK_URL = '/data/detail.csv';

async function fetchTextWithTimeout(url: string, timeoutMs = 30000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const text = await res.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Empty response received');
    }
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

async function fetchSummaryDataset(): Promise<{ text: string; isCached: boolean }> {
  // 1. Try Dev Proxy if in dev mode
  if (import.meta.env.DEV) {
    try {
      const text = await fetchTextWithTimeout(SUMMARY_PROXY_URL, 25000);
      return { text, isCached: false };
    } catch (err) {
      console.warn('Dev proxy failed for summary, attempting direct live endpoint...', err);
    }
  }

  // 2. Try Direct Live Metabase URL
  try {
    const text = await fetchTextWithTimeout(SUMMARY_LIVE_URL, 30000);
    return { text, isCached: false };
  } catch (err) {
    console.warn('Direct live summary fetch failed, falling back to cached CSV snapshot...', err);
  }

  // 3. Fallback to local snapshot
  try {
    const res = await fetch(SUMMARY_FALLBACK_URL);
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
    const text = await res.text();
    return { text, isCached: true };
  } catch (err) {
    console.error('Failed to load local summary fallback:', err);
    throw err;
  }
}

async function fetchDetailDataset(): Promise<{ text: string; isCached: boolean }> {
  // 1. Try Dev Proxy if in dev mode
  if (import.meta.env.DEV) {
    try {
      const text = await fetchTextWithTimeout(DETAIL_PROXY_URL, 30000);
      return { text, isCached: false };
    } catch (err) {
      console.warn('Dev proxy failed for detail, attempting direct live endpoint...', err);
    }
  }

  // 2. Try Direct Live Metabase URL
  try {
    const text = await fetchTextWithTimeout(DETAIL_LIVE_URL, 35000);
    return { text, isCached: false };
  } catch (err) {
    console.warn('Direct live detail fetch failed, falling back to cached CSV snapshot...', err);
  }

  // 3. Fallback to local snapshot
  try {
    const res = await fetch(DETAIL_FALLBACK_URL);
    if (!res.ok) throw new Error(`Fallback HTTP ${res.status}`);
    const text = await res.text();
    return { text, isCached: true };
  } catch (err) {
    console.error('Failed to load local detail fallback:', err);
    throw err;
  }
}

export async function loadInventoryData(): Promise<LoadedDataResult> {
  // Fetch summary and detail in parallel
  const [summaryResult, detailResult] = await Promise.all([
    fetchSummaryDataset(),
    fetchDetailDataset(),
  ]);

  const summaryMatrix = parseSummaryCSV(summaryResult.text);
  const detailRows = parseDetailCSV(detailResult.text);

  const isCached = summaryResult.isCached || detailResult.isCached;

  const dataTimestamp = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return {
    summaryMatrix,
    detailRows,
    isCachedFallback: isCached,
    dataTimestamp,
  };
}
