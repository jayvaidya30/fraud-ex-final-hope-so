"use client";

import { Header } from "@/components/layout/header";
import {
    KPICard,
    RiskTrendsChart,
    SignalDistributionChart,
    RiskDistributionChart,
    RecentCasesList,
} from "@/components/dashboard";
import {
    FileWarningIcon,
    ShieldAlertIcon,
    TrendingUpIcon,
    ActivityIcon,
    AlertCircleIcon,
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function DashboardPage() {
    const { dashboardData, loading, error } = useAnalytics();

    return (
        <>
            <Header
                title="Dashboard"
                description="FraudEx Analytics Overview"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircleIcon className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* KPI Cards Row */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard
                        title="Total Cases"
                        value={dashboardData.totalCases}
                        icon={FileWarningIcon}
                        trend="up"
                        trendValue="+12% from last week"
                        className="from-slate-900 to-slate-800 text-white"
                        iconClassName="text-slate-300"
                        isLoading={loading}
                    />
                    <KPICard
                        title="High Risk Cases"
                        value={dashboardData.highRiskCases}
                        icon={ShieldAlertIcon}
                        trend="down"
                        trendValue="-5% from last week"
                        className="from-rose-600 to-rose-700 text-white"
                        iconClassName="text-rose-200"
                        isLoading={loading}
                    />
                    <KPICard
                        title="Avg Risk Score"
                        value={dashboardData.avgRiskScore}
                        decimalPlaces={1}
                        icon={TrendingUpIcon}
                        trend="neutral"
                        trendValue="Stable"
                        className="from-amber-500 to-orange-600 text-white"
                        iconClassName="text-amber-100"
                        isLoading={loading}
                    />
                    <KPICard
                        title="Analyzed Today"
                        value={dashboardData.analyzedToday}
                        icon={ActivityIcon}
                        trend="up"
                        trendValue="+3 from yesterday"
                        className="from-emerald-500 to-teal-600 text-white"
                        iconClassName="text-emerald-100"
                        isLoading={loading}
                    />
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Risk Trends Chart - spans 2 columns */}
                    <RiskTrendsChart />

                    {/* Risk Distribution Pie Chart */}
                    <RiskDistributionChart />
                </div>

                {/* Bottom Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Signal Distribution Bar Chart */}
                    <SignalDistributionChart />

                    {/* Recent Cases List */}
                    <RecentCasesList />
                </div>
            </div>
        </>
    );
}
