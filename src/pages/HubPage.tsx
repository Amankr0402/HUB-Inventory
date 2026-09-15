import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Package,
  TrendingUp,
  AlertOctagon,
  Users,
} from 'lucide-react';
import { useData } from '../store/DataContext';
import {
  getStockOverviewStats,
  getToyTypeBreakdown,
  getAvailabilityBuckets,
  getAgeGroupCoverage,
} from '../data/aggregate';
import { SectionHeader } from '../components/layout/SectionHeader';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { MetricTile } from '../components/ui/MetricTile';
import { StockStackedBar } from '../components/charts/StockStackedBar';
import { BucketBar } from '../components/charts/BucketBar';
import { AgeGroupBar } from '../components/charts/AgeGroupBar';
import { ToyTypeBadge } from '../components/ui/Badge';
import { formatNumber, formatPercent, formatDecimal } from '../utils/format';
import type { ToyType } from '../types';

export const HubPage: React.FC = () => {
  const { hubName } = useParams<{ hubName: string }>();
  const decodedHub = decodeURIComponent(hubName || '');
  const navigate = useNavigate();

  const {
    summaryMatrix,
    detailRows,
    selectedToyType,
    openDrilldownModal,
    isLoading,
  } = useData();

  // Aggregate stats locked to this hub
  const stockStats = useMemo(() => {
    if (!summaryMatrix) return null;
    return getStockOverviewStats(summaryMatrix, decodedHub, selectedToyType);
  }, [summaryMatrix, decodedHub, selectedToyType]);

  const typeSplits = useMemo(() => {
    if (!summaryMatrix) return [];
    return getToyTypeBreakdown(summaryMatrix, decodedHub);
  }, [summaryMatrix, decodedHub]);

  const availabilityBuckets = useMemo(() => {
    return getAvailabilityBuckets(detailRows, decodedHub, selectedToyType);
  }, [detailRows, decodedHub, selectedToyType]);

  const ageGroupCoverage = useMemo(() => {
    return getAgeGroupCoverage(detailRows, decodedHub, selectedToyType);
  }, [detailRows, decodedHub, selectedToyType]);

  if (isLoading && !summaryMatrix) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-purple-800">Loading hub analytics...</p>
      </div>
    );
  }

  if (!stockStats || !summaryMatrix) {
    return (
      <div className="py-16 text-center bg-white p-8 rounded-2xl shadow-card max-w-md mx-auto">
        <h3 className="text-base font-bold text-slate-800 mb-2">Hub Not Found</h3>
        <p className="text-xs text-slate-500 mb-4">Could not find inventory data for "{decodedHub}".</p>
        <Link
          to="/"
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 inline-block"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const triggerDrilldown = (metric: string, toyTypeOverride?: ToyType) => {
    openDrilldownModal({
      metric,
      type: toyTypeOverride || selectedToyType,
      hub: decodedHub,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Back Navigation & Hub Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-purple-700 text-xs font-bold shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Hubs Dashboard</span>
          </button>

          <div className="h-4 w-px bg-purple-200" />

          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {decodedHub}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
            {formatNumber(stockStats.activeSubscribers)} Active Subscribers
          </span>
        </div>
      </div>

      {/* SECTION 1: 📦 STOCK OVERVIEW FOR THIS HUB */}
      <section>
        <SectionHeader
          title={`STOCK OVERVIEW — ${decodedHub}`}
          emoji="📦"
          badge={`${selectedToyType === 'All' ? 'All Types' : `${selectedToyType} Toys`}`}
        />

        <Card topBorderColor="#059669" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Headline */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-purple-100/70 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Hub Units
                </span>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                  <Package className="w-4 h-4 text-emerald-600" />
                </span>
              </div>

              <div
                onClick={() => triggerDrilldown('Total Stock')}
                className="my-3 cursor-pointer group inline-block"
                title="Click to drill down into hub stock"
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {formatNumber(stockStats.totalStock)}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium">
                <strong className="text-slate-700">{formatNumber(stockStats.uniqueSkus)}</strong> unique SKUs in catalog
              </p>
            </div>

            {/* Right Side: Horizontal Stacked Bar */}
            <div className="lg:col-span-8 lg:pl-2">
              <StockStackedBar
                available={stockStats.available}
                rented={stockStats.rentedOut}
                damages={stockStats.damages}
                onDrilldown={(metric) => triggerDrilldown(metric)}
              />
            </div>
          </div>

          {/* Sub-metric Tiles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-purple-100/80">
            <MetricTile
              label="Rented Out"
              value={formatNumber(stockStats.rentedOut)}
              caption={`${formatPercent(stockStats.utilisationRate)} yield`}
              dotColor="#7C3AED"
              onClick={() => triggerDrilldown('Rented Out')}
            />

            <MetricTile
              label="Available"
              value={formatNumber(stockStats.available)}
              caption="Ready to rent"
              dotColor="#10B981"
              onClick={() => triggerDrilldown('Available')}
            />

            <MetricTile
              label="Damages"
              value={formatNumber(stockStats.damages)}
              caption={`${formatPercent(stockStats.damageRate)} defect`}
              variant="warning"
              onClick={() => triggerDrilldown('Damages')}
            />

            <MetricTile
              label="Unique SKUs"
              value={formatNumber(stockStats.uniqueSkus)}
              caption="Titles"
              dotColor="#0891B2"
              onClick={() => triggerDrilldown('Unique SKUs')}
            />

            <MetricTile
              label="Visible in App"
              value={formatNumber(stockStats.visibleToCustomers)}
              caption={`${formatPercent(stockStats.uniqueSkus > 0 ? stockStats.visibleToCustomers / stockStats.uniqueSkus : 0)} of catalog`}
              dotColor="#6366F1"
              onClick={() => triggerDrilldown('Visible to Customers')}
            />

            <MetricTile
              label="Not Ordered (6m)"
              value={formatNumber(stockStats.notOrdered6mo)}
              caption="Stagnant SKUs"
              dotColor="#EA580C"
              onClick={() => triggerDrilldown('Not Ordered in 6mo')}
            />
          </div>
        </Card>
      </section>

      {/* SECTION 2: 🎯 TYPE SPLIT (BIG / TOY / BOOKS) */}
      <section>
        <SectionHeader title="TYPE SPLIT (CATEGORY BREAKDOWN)" emoji="🧸" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {typeSplits.map((item) => (
            <Card
              key={item.type}
              topBorderColor={
                item.type === 'Big'
                  ? '#0D9488'
                  : item.type === 'Toy'
                  ? '#7C3AED'
                  : '#F59E0B'
              }
              className="p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-50 pb-2">
                <ToyTypeBadge type={item.type} />
                <span className="text-xs text-slate-500 font-medium">
                  {formatNumber(item.uniqueSkus)} SKUs
                </span>
              </div>

              <div
                onClick={() => triggerDrilldown('Total Stock', item.type as ToyType)}
                className="cursor-pointer group"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Units
                </span>
                <span className="text-3xl font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
                  {formatNumber(item.total)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-50 text-xs">
                <div
                  onClick={() => triggerDrilldown('Available', item.type as ToyType)}
                  className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] text-emerald-800 font-medium block">Available</span>
                  <span className="font-extrabold text-emerald-900">{formatNumber(item.available)}</span>
                </div>

                <div
                  onClick={() => triggerDrilldown('Rented Out', item.type as ToyType)}
                  className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100/70 border border-purple-100 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] text-purple-800 font-medium block">Rented</span>
                  <span className="font-extrabold text-purple-900">{formatNumber(item.rented)}</span>
                </div>

                <div
                  onClick={() => triggerDrilldown('Damages', item.type as ToyType)}
                  className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100/70 border border-amber-100 cursor-pointer transition-colors"
                >
                  <span className="text-[10px] text-amber-800 font-medium block">Damaged</span>
                  <span className="font-extrabold text-amber-900">{formatNumber(item.damages)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                <span>Utilisation: <strong className="text-purple-700">{formatPercent(item.utilisationRate)}</strong></span>
                <span>Damage: <strong className="text-amber-600">{formatPercent(item.damageRate)}</strong></span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* SECTION 3: 📊 UTILISATION & HEALTH */}
      <section>
        <SectionHeader title="HUB PERFORMANCE & HEALTH" emoji="📊" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Utilisation Rate"
            value={formatPercent(stockStats.utilisationRate)}
            caption="Rented Out ÷ Total Stock"
            topBorderColor="#7C3AED"
            valueColor="#7C3AED"
            icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
            onClick={() => triggerDrilldown('Rented Out')}
          />

          <KpiCard
            label="Damage Rate"
            value={formatPercent(stockStats.damageRate)}
            caption="Damages ÷ Total Stock"
            topBorderColor="#EA580C"
            valueColor="#EA580C"
            icon={<AlertOctagon className="w-4 h-4 text-orange-500" />}
            onClick={() => triggerDrilldown('Damages')}
          />

          <KpiCard
            label="Active Subscribers"
            value={formatNumber(stockStats.activeSubscribers)}
            caption={
              <span>
                Stock per sub:{' '}
                <strong className="text-slate-700">{formatDecimal(stockStats.stockPerSubscriber, 1)}</strong> units
              </span>
            }
            topBorderColor="#0891B2"
            valueColor="#0891B2"
            icon={<Users className="w-4 h-4 text-cyan-600" />}
            onClick={() => triggerDrilldown('Active Subscribers')}
          />
        </div>
      </section>

      {/* SECTION 4: 🎯 DISTRIBUTIONS FOR THIS HUB */}
      <section>
        <SectionHeader title="HUB DISTRIBUTIONS & COVERAGE" emoji="🎯" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Availability Buckets ({decodedHub})
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold">Click to drill down</span>
            </div>
            <BucketBar
              data={availabilityBuckets}
              onBarClick={(bucket) => triggerDrilldown(bucket)}
            />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Age Group Coverage ({decodedHub})
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold">Click to drill down</span>
            </div>
            <AgeGroupBar
              data={ageGroupCoverage}
              onBarClick={(ageGroup) => triggerDrilldown(`Age Group ${ageGroup}`)}
            />
          </Card>
        </div>
      </section>
    </div>
  );
};
