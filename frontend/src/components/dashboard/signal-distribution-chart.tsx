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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { useSignalDistribution } from "@/hooks/use-analytics";

const chartConfig: ChartConfig = {
    count: {
        label: "Occurrences",
    },
    "Vendor Risk": {
        label: "Vendor Risk",
        color: "hsl(var(--chart-1))",
    },
    "Amount Pattern": {
        label: "Amount Pattern",
        color: "hsl(var(--chart-2))",
    },
    "Round Numbers": {
        label: "Round Numbers",
        color: "hsl(var(--chart-3))",
    },
    Velocity: {
        label: "Velocity",
        color: "hsl(var(--chart-4))",
    },
    Unverified: {
        label: "Unverified",
        color: "hsl(var(--chart-5))",
    },
};

export function SignalDistributionChart() {
    const { data, loading, error } = useSignalDistribution();

    if (loading) {
        return (
            <Card>
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
        <Card>
            <CardHeader>
                <CardTitle>Signal Distribution</CardTitle>
                <CardDescription>
                    {error ? error : "Top fraud detection signals triggered"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No signals detected yet
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                            <XAxis
                                type="number"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                type="category"
                                dataKey="signal"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                width={100}
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
