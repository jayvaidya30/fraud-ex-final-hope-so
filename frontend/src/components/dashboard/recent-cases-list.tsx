"use client";

import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCases, type Case } from "@/hooks/use-cases";

const statusColors = {
    uploaded: "bg-slate-500",
    processing: "bg-blue-500",
    analyzed: "bg-emerald-500",
    failed: "bg-red-500",
};

const riskBadgeVariants = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function RecentCasesList() {
    const { cases, loading, error } = useCases();

    // Show only the 5 most recent cases
    const recentCases = cases.slice(0, 5);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                                <Skeleton className="h-6 w-16" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Cases</CardTitle>
                <CardDescription>
                    {error ? error : "Latest analyzed documents"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[320px] pr-4">
                    {recentCases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <p>No cases yet</p>
                            <p className="text-sm">Upload a document to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentCases.map((caseItem) => (
                                <Link
                                    key={caseItem.id}
                                    href={`/cases/${caseItem.id}`}
                                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    statusColors[caseItem.status]
                                                )}
                                            />
                                            <span className="font-medium">{caseItem.caseId}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {caseItem.createdAt}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {caseItem.riskScore !== undefined && (
                                            <span className="text-sm font-semibold tabular-nums">
                                                {caseItem.riskScore}
                                            </span>
                                        )}
                                        {caseItem.riskLevel && (
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    "capitalize",
                                                    riskBadgeVariants[caseItem.riskLevel]
                                                )}
                                            >
                                                {caseItem.riskLevel}
                                            </Badge>
                                        )}
                                        {caseItem.status === "processing" && (
                                            <Badge variant="secondary">Processing</Badge>
                                        )}
                                        {caseItem.status === "failed" && (
                                            <Badge variant="destructive">Failed</Badge>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
