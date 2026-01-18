"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartConfig,
} from "@/components/ui/chart";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { useRiskTrends } from "@/hooks/use-analytics";

const chartConfig: ChartConfig = {
    avgRiskScore: {
        label: "Avg Risk Score",
        color: "hsl(var(--chart-1))",
    },
    highRiskCount: {
        label: "High Risk Cases",
        color: "hsl(var(--chart-2))",
    },
};

export function RiskTrendsChart() {
    const { data, loading, error } = useRiskTrends();

    if (loading) {
        return (
            <Card className="col-span-full lg:col-span-2">
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>Risk Score Trends</CardTitle>
                <CardDescription>
                    {error ? error : "Monthly risk score and high-risk case trends"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No trend data available yet
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                                type="monotone"
                                dataKey="avgRiskScore"
                                stroke="var(--color-avgRiskScore)"
                                strokeWidth={2}
                                dot={{ fill: "var(--color-avgRiskScore)", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="highRiskCount"
                                stroke="var(--color-highRiskCount)"
                                strokeWidth={2}
                                dot={{ fill: "var(--color-highRiskCount)", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
