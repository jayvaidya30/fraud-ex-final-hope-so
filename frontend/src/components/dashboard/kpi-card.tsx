"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Skeleton } from "@/components/ui/skeleton";
import {
    FileWarningIcon,
    ShieldAlertIcon,
    TrendingUpIcon,
    ActivityIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: number;
    previousValue?: number;
    suffix?: string;
    prefix?: string;
    decimalPlaces?: number;
    icon: React.ElementType;
    trend?: "up" | "down" | "neutral";
    trendValue?: string;
    className?: string;
    iconClassName?: string;
    isLoading?: boolean;
}

export function KPICard({
    title,
    value,
    suffix = "",
    prefix = "",
    decimalPlaces = 0,
    icon: Icon,
    trend = "neutral",
    trendValue,
    className,
    iconClassName,
    isLoading = false,
}: KPICardProps) {
    return (
        <Card
            className={cn(
                "relative overflow-hidden border-0 bg-gradient-to-br shadow-lg",
                className
            )}
        >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div
                    className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm",
                        iconClassName
                    )}
                >
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-24 bg-white/20" />
                        <Skeleton className="h-4 w-16 bg-white/10" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-1">
                            {prefix && (
                                <span className="text-2xl font-bold tracking-tight">{prefix}</span>
                            )}
                            <NumberTicker
                                value={value}
                                decimalPlaces={decimalPlaces}
                                className="text-3xl font-bold tracking-tight"
                            />
                            {suffix && (
                                <span className="text-xl font-semibold text-muted-foreground">
                                    {suffix}
                                </span>
                            )}
                        </div>
                        {trendValue && (
                            <p
                                className={cn("mt-1 text-xs", {
                                    "text-emerald-400": trend === "up",
                                    "text-red-400": trend === "down",
                                    "text-muted-foreground": trend === "neutral",
                                })}
                            >
                                {trend === "up" && "↑ "}
                                {trend === "down" && "↓ "}
                                {trendValue}
                            </p>
                        )}
                    </>
                )}
            </CardContent>

            {/* Decorative gradient orb */}
            <div className="pointer-events-none absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
        </Card>
    );
}

// Default export for convenient importing
export const kpiCards = [
    {
        id: "total-cases",
        title: "Total Cases",
        icon: FileWarningIcon,
        className: "from-slate-900 to-slate-800 text-white",
        iconClassName: "text-slate-300",
    },
    {
        id: "high-risk",
        title: "High Risk Cases",
        icon: ShieldAlertIcon,
        className: "from-rose-600 to-rose-700 text-white",
        iconClassName: "text-rose-200",
    },
    {
        id: "avg-risk-score",
        title: "Avg Risk Score",
        icon: TrendingUpIcon,
        className: "from-amber-500 to-orange-600 text-white",
        iconClassName: "text-amber-100",
    },
    {
        id: "analyzed-today",
        title: "Analyzed Today",
        icon: ActivityIcon,
        className: "from-emerald-500 to-teal-600 text-white",
        iconClassName: "text-emerald-100",
    },
];
