import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  AlertOctagon,
  Users,
  Award,
} from 'lucide-react';
import { useData } from '../store/DataContext';
import {
  getStockOverviewStats,
  getHubSummaries,
  getTopHubsByUtilisation,
  getTopHubsByDamages,
  getHubDamageRankList,
  getAvailabilityBuckets,
  getAgeGroupCoverage,
} from '../data/aggregate';
import { SectionHeader } from '../components/layout/SectionHeader';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { MetricTile } from '../components/ui/MetricTile';
import { Avatar } from '../components/ui/Avatar';
import { StockStackedBar } from '../components/charts/StockStackedBar';
import { HubGroupedBar } from '../components/charts/HubGroupedBar';
import { HubDamageLeaderboard } from '../components/charts/HubDamageLeaderboard';
import { BucketBar } from '../components/charts/BucketBar';
import { AgeGroupBar } from '../components/charts/AgeGroupBar';
import { HubTable } from '../components/tables/HubTable';
import { formatNumber, formatPercent, formatDecimal } from '../utils/format';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    summaryMatrix,
    detailRows,
    selectedHub,
    selectedToyType,
    openDrilldownModal,
    isLoading,
    isError,
    errorMessage,
    refetch,
  } = useData();

  // Aggregate stats
  const stockStats = useMemo(() => {
    if (!summaryMatrix) return null;
    return getStockOverviewStats(summaryMatrix, selectedHub, selectedToyType);
  }, [summaryMatrix, selectedHub, selectedToyType]);

  const hubSummaries = useMemo(() => {
    if (!summaryMatrix) return [];
    return getHubSummaries(summaryMatrix, selectedToyType);
  }, [summaryMatrix, selectedToyType]);

  const topUtilisationHubs = useMemo(() => {
    return getTopHubsByUtilisation(hubSummaries, 5);
  }, [hubSummaries]);

  const topDamageHubs = useMemo(() => {
    return getTopHubsByDamages(hubSummaries, 5);
  }, [hubSummaries]);

  const hubDamageRankList = useMemo(() => {
    if (!summaryMatrix) return [];
    return getHubDamageRankList(summaryMatrix, selectedToyType);
  }, [summaryMatrix, selectedToyType]);

  const availabilityBuckets = useMemo(() => {
    return getAvailabilityBuckets(detailRows, selectedHub, selectedToyType);
  }, [detailRows, selectedHub, selectedToyType]);

  const ageGroupCoverage = useMemo(() => {
    return getAgeGroupCoverage(detailRows, selectedHub, selectedToyType);
  }, [detailRows, selectedHub, selectedToyType]);

  if (isLoading && !summaryMatrix) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-purple-800">Loading toy inventory analytics...</p>
      </div>
    );
  }

  if (isError && !summaryMatrix) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center bg-white p-8 rounded-2xl shadow-card border border-rose-100">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertOctagon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">Failed to Load Datasets</h3>
        <p className="text-xs text-slate-500 mb-4">{errorMessage || 'Unable to connect to Metabase endpoints.'}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors"
        >
          Retry Fetching
        </button>
      </div>
    );
  }

  if (!stockStats || !summaryMatrix) return null;

  const triggerDrilldown = (metric: string, hubOverride?: string) => {
    openDrilldownModal({
      metric,
      type: selectedToyType,
      hub: hubOverride || selectedHub,
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* SECTION 1: 📦 STOCK OVERVIEW */}
      <section>
        <SectionHeader
          title="STOCK OVERVIEW"
          emoji="📦"
          badge={`${selectedHub === 'All' ? '14 Libraries' : selectedHub} • ${selectedToyType === 'All' ? 'All Types' : `${selectedToyType} Toys`}`}
        />

        {/* Big Card with Green Top Border */}
        <Card topBorderColor="#059669" className="overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Headline KPI */}
            <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-purple-100/70 pb-6 lg:pb-0 lg:pr-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Stock (Physical Units)
                </span>
                <span className="p-1 rounded-md bg-emerald-50 text-emerald-700">
                  <Package className="w-4 h-4 text-emerald-600" />
                </span>
              </div>

              <div
                onClick={() => triggerDrilldown('Total Stock')}
                className="my-3 cursor-pointer group inline-block"
                title="Click to drill down into all physical stock"
              >
                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-600 tracking-tight group-hover:text-emerald-700 transition-colors">
                  {formatNumber(stockStats.totalStock)}
                </div>
              </div>

              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                <strong className="text-slate-700">{formatNumber(stockStats.uniqueSkus)}</strong> unique SKUs across{' '}
                <strong className="text-slate-700">{stockStats.hubCount}</strong> hub{stockStats.hubCount > 1 ? 's' : ''}
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
              caption={`${formatPercent(stockStats.utilisationRate)} of stock`}
              dotColor="#7C3AED"
              onClick={() => triggerDrilldown('Rented Out')}
            />

            <MetricTile
              label="Available"
              value={formatNumber(stockStats.available)}
              caption={`${formatPercent(stockStats.totalStock > 0 ? stockStats.available / stockStats.totalStock : 0)} ready`}
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

      {/* SECTION 2: 📊 UTILISATION & HEALTH */}
      <section>
        <SectionHeader title="UTILISATION & HEALTH" emoji="📊" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard
            label="Utilisation Rate"
            value={formatPercent(stockStats.utilisationRate)}
            caption={
              <span>
                <strong>{formatNumber(stockStats.rentedOut)}</strong> Rented Out ÷{' '}
                <strong>{formatNumber(stockStats.totalStock)}</strong> Total Stock
              </span>
            }
            topBorderColor="#7C3AED"
            valueColor="#7C3AED"
            icon={<TrendingUp className="w-4 h-4 text-purple-500" />}
            onClick={() => triggerDrilldown('Rented Out')}
          />

          <KpiCard
            label="Damage Rate"
            value={formatPercent(stockStats.damageRate)}
            caption={
              <span>
                <strong>{formatNumber(stockStats.damages)}</strong> Damaged ÷{' '}
                <strong>{formatNumber(stockStats.totalStock)}</strong> Total Stock
              </span>
            }
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
                Stock per subscriber:{' '}
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

      {/* SECTION 3: 🏬 HUB BREAKDOWN */}
      <section>
        <SectionHeader
          title="HUB BREAKDOWN"
          emoji="🏬"
          badge="Sortable Matrix"
        />

        <div className="space-y-4">
          {/* Grouped Bar Chart of Total Stock by Hub Split by Toy Type */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Total Stock By Hub (Split by Type)
              </h3>
              <span className="text-[11px] text-slate-400">Click bar to view hub detail</span>
            </div>
            <HubGroupedBar
              summary={summaryMatrix}
              onSelectHub={(hub) => navigate(`/hub/${encodeURIComponent(hub)}`)}
            />
          </Card>

          {/* Hub Summary Matrix Table */}
          <HubTable
            summaries={hubSummaries}
            selectedToyType={selectedToyType}
            onCellClick={(metric, hub) => triggerDrilldown(metric, hub)}
          />
        </div>
      </section>

      {/* SECTION 4: ⚠️ HUB-WISE DAMAGE ANALYSIS (TOP TO BOTTOM) */}
      <section id="damage-audit-section">
        <SectionHeader
          title="HUB-WISE DAMAGE ANALYSIS"
          emoji="⚠️"
          badge={`${selectedToyType === 'All' ? 'All Toy Types' : `${selectedToyType} Toys`} • Top to Bottom Ranked`}
        />

        <Card topBorderColor="#E11D48" className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-rose-100/70 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Total Hub-Wise Damage Counts
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ranked from highest damage to lowest • Click any hub to inspect damaged items
              </p>
            </div>
            <button
              onClick={() => triggerDrilldown('Damages', 'All')}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors shadow-2xs"
            >
              Drill-down All Network Damages →
            </button>
          </div>

          <HubDamageLeaderboard
            items={hubDamageRankList}
            onDrilldownDamages={(hub) => triggerDrilldown('Damages', hub)}
            onSelectHub={(hub) => navigate(`/hub/${encodeURIComponent(hub)}`)}
          />
        </Card>
      </section>

      {/* SECTION 5: 🎯 KEY INSIGHTS */}
      <section>
        <SectionHeader title="KEY INSIGHTS" emoji="🎯" />

        {/* Top 5 Rankings Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Top 5 by Utilisation */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 border-b border-purple-50 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-purple-100 text-purple-700">
                  <Award className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Top 5 Hubs by Utilisation Rate
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-purple-600">Highest rental yield</span>
            </div>

            <div className="space-y-2.5">
              {topUtilisationHubs.map((item, idx) => (
                <div
                  key={item.hub}
                  onClick={() => triggerDrilldown('Rented Out', item.hub)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50/60 border border-transparent hover:border-purple-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-400 w-4">{idx + 1}</span>
                    <Avatar initials={item.initials} color={item.color} size="sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-purple-700 transition-colors block">
                        {item.hub}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatNumber(item.numerator)} rented / {formatNumber(item.denominator)} total
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-purple-700">
                      {formatPercent(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top 5 by Damage Rate */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4 border-b border-purple-50 pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-amber-100 text-amber-700">
                  <AlertOctagon className="w-4 h-4 text-amber-600" />
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Top 5 Hubs by Damage Rate
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-600">Requires QA audit</span>
            </div>

            <div className="space-y-2.5">
              {topDamageHubs.map((item, idx) => (
                <div
                  key={item.hub}
                  onClick={() => triggerDrilldown('Damages', item.hub)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50/60 border border-transparent hover:border-amber-100 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-400 w-4">{idx + 1}</span>
                    <Avatar initials={item.initials} color={item.color} size="sm" />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-amber-700 transition-colors block">
                        {item.hub}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatNumber(item.numerator)} damaged / {formatNumber(item.denominator)} total
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-amber-600">
                      {formatPercent(item.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Distributions: Availability Buckets & Age Group Coverage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Availability Buckets
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold">Click bar to drill down</span>
            </div>
            <BucketBar
              data={availabilityBuckets}
              onBarClick={(bucket) => triggerDrilldown(bucket)}
            />
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Age Group Coverage
              </h3>
              <span className="text-[11px] text-purple-600 font-semibold">Click bar to drill down</span>
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
