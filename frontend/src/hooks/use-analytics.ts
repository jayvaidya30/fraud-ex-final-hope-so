"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getAnalyticsSummary,
    getRiskDistribution,
    getSignalBreakdown,
    ApiError,
} from "@/services/api";

export interface DashboardData {
    totalCases: number;
    highRiskCases: number;
    avgRiskScore: number;
    analyzedToday: number;
}

const emptyDashboardData: DashboardData = {
    totalCases: 0,
    highRiskCases: 0,
    avgRiskScore: 0,
    analyzedToday: 0,
};

export interface UseAnalyticsReturn {
    dashboardData: DashboardData;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
    const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboardData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const summary = await getAnalyticsSummary();
            setDashboardData({
                totalCases: summary.total_cases,
                highRiskCases: summary.high_risk_count + summary.critical_risk_count,
                avgRiskScore: summary.avg_risk_score,
                analyzedToday: summary.analyzed_cases,
            });
        } catch (err) {
            console.error("Failed to fetch analytics:", err);
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Please log in to view analytics.");
                } else {
                    setError(err.message || "Failed to load analytics.");
                }
            } else {
                setError("Failed to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    return { dashboardData, loading, error, refetch: fetchAnalytics };
}

export interface RiskDistributionItem {
    level: string;
    count: number;
    fill: string;
}

export interface UseRiskDistributionReturn {
    data: RiskDistributionItem[];
    loading: boolean;
    error: string | null;
}

export function useRiskDistribution(): UseRiskDistributionReturn {
    const [data, setData] = useState<RiskDistributionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await getRiskDistribution();
                const dist = response.distribution;
                setData([
                    { level: "low", count: dist.low, fill: "hsl(142, 76%, 36%)" },
                    { level: "medium", count: dist.medium, fill: "hsl(48, 96%, 53%)" },
                    { level: "high", count: dist.high, fill: "hsl(25, 95%, 53%)" },
                    { level: "critical", count: dist.critical, fill: "hsl(0, 84%, 60%)" },
                ]);
            } catch (err) {
                console.error("Failed to fetch risk distribution:", err);
                if (err instanceof ApiError) {
                    if (err.status === 401) {
                        setError("Please log in to view risk distribution.");
                    } else {
                        setError(err.message || "Failed to load risk distribution.");
                    }
                } else {
                    setError("Failed to connect to the server.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return { data, loading, error };
}

export interface SignalItem {
    signal: string;
    count: number;
    fill: string;
}

export interface UseSignalDistributionReturn {
    data: SignalItem[];
    loading: boolean;
    error: string | null;
}

const signalColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
];

export function useSignalDistribution(): UseSignalDistributionReturn {
    const [data, setData] = useState<SignalItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await getSignalBreakdown();
                setData(
                    response.signals.slice(0, 5).map((sig, i) => ({
                        signal: sig.name,
                        count: sig.triggered_count,
                        fill: signalColors[i % signalColors.length],
                    }))
                );
            } catch (err) {
                console.error("Failed to fetch signal distribution:", err);
                if (err instanceof ApiError) {
                    if (err.status === 401) {
                        setError("Please log in to view signals.");
                    } else {
                        setError(err.message || "Failed to load signals.");
                    }
                } else {
                    setError("Failed to connect to the server.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return { data, loading, error };
}

export interface TrendPoint {
    date: string;
    avgRiskScore: number;
    highRiskCount: number;
}

export interface UseRiskTrendsReturn {
    data: TrendPoint[];
    loading: boolean;
    error: string | null;
}

export function useRiskTrends(): UseRiskTrendsReturn {
    const [data, setData] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const summary = await getAnalyticsSummary();
                if (summary.trends_30d?.length > 0) {
                    setData(
                        summary.trends_30d.map((t) => ({
                            date: t.date,
                            avgRiskScore: t.avg_risk_score,
                            highRiskCount: t.high_risk_count,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to fetch risk trends:", err);
                if (err instanceof ApiError) {
                    if (err.status === 401) {
                        setError("Please log in to view trends.");
                    } else {
                        setError(err.message || "Failed to load trends.");
                    }
                } else {
                    setError("Failed to connect to the server.");
                }
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    return { data, loading, error };
}
