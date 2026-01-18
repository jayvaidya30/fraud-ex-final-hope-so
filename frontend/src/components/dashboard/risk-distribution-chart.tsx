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
    ChartLegend,
    ChartLegendContent,
    ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label } from "recharts";
import { useRiskDistribution } from "@/hooks/use-analytics";

const chartConfig: ChartConfig = {
    count: {
        label: "Cases",
    },
    low: {
        label: "Low Risk",
        color: "hsl(142, 76%, 36%)",
    },
    medium: {
        label: "Medium Risk",
        color: "hsl(48, 96%, 53%)",
    },
    high: {
        label: "High Risk",
        color: "hsl(25, 95%, 53%)",
    },
    critical: {
        label: "Critical",
        color: "hsl(0, 84%, 60%)",
    },
};

export function RiskDistributionChart() {
    const { data, loading, error } = useRiskDistribution();
    const totalCases = data.reduce((sum, item) => sum + item.count, 0);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-60" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="mx-auto h-[250px] w-[250px] rounded-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
                <CardDescription>
                    {error ? error : "Cases by risk level"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                        No data available
                    </div>
                ) : (
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                            <Pie
                                data={data}
                                dataKey="count"
                                nameKey="level"
                                innerRadius={60}
                                outerRadius={100}
                                strokeWidth={2}
                                stroke="hsl(var(--background))"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-3xl font-bold"
                                                    >
                                                        {totalCases}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 24}
                                                        className="fill-muted-foreground text-sm"
                                                    >
                                                        Total Cases
                                                    </tspan>
                                                </text>
                                            );
                                        }
                                    }}
                                />
                            </Pie>
                            <ChartLegend
                                content={<ChartLegendContent nameKey="level" />}
                                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                            />
                        </PieChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    );
}
