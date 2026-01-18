"use client";

import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
    RiskTrendsChart,
    SignalDistributionChart,
    RiskDistributionChart,
} from "@/components/dashboard";
import {
    TrendingUpIcon,
    TrendingDownIcon,
    AlertCircleIcon,
} from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function AnalyticsPage() {
    const { dashboardData, loading, error } = useAnalytics();

    return (
        <>
            <Header
                title="Analytics"
                description="Deep dive into fraud detection metrics"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircleIcon className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Time Period Tabs */}
                <Tabs defaultValue="7d" className="w-full">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="24h">24 Hours</TabsTrigger>
                            <TabsTrigger value="7d">7 Days</TabsTrigger>
                            <TabsTrigger value="30d">30 Days</TabsTrigger>
                            <TabsTrigger value="90d">90 Days</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="7d" className="mt-6 space-y-6">
                        {/* Key Metrics Summary */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Cases Analyzed</p>
                                            {loading ? (
                                                <Skeleton className="h-8 w-20" />
                                            ) : (
                                                <p className="text-2xl font-bold">{dashboardData.totalCases.toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-500">
                                            <TrendingUpIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">+18%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Signals Detected</p>
                                            {loading ? (
                                                <Skeleton className="h-8 w-20" />
                                            ) : (
                                                <p className="text-2xl font-bold">{dashboardData.highRiskCases.toLocaleString()}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-red-500">
                                            <TrendingUpIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">+24%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Avg Processing Time</p>
                                            <p className="text-2xl font-bold">4.2s</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-500">
                                            <TrendingDownIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">-8%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Detection Rate</p>
                                            <p className="text-2xl font-bold">94.2%</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-emerald-500">
                                            <TrendingUpIcon className="h-4 w-4" />
                                            <span className="text-sm font-medium">+2.1%</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            <RiskTrendsChart />
                            <RiskDistributionChart />
                        </div>

                        <div className="grid gap-6 lg:grid-cols-2">
                            <SignalDistributionChart />

                            {/* AI Insights Placeholder */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>AI-Generated Insights</CardTitle>
                                    <CardDescription>
                                        Automatically detected patterns and anomalies
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                                        <p>No insights available yet</p>
                                        <p className="text-sm">Upload and analyze documents to generate insights</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="24h">
                        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                            24-hour analytics view coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="30d">
                        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                            30-day analytics view coming soon...
                        </div>
                    </TabsContent>

                    <TabsContent value="90d">
                        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                            90-day analytics view coming soon...
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
