"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    PlusIcon,
    SearchIcon,
    FileTextIcon,
    CalendarIcon,
    WifiOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCases } from "@/hooks/use-cases";
import { useState, useMemo } from "react";

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

function CaseCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-2 w-2 rounded-full" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="mt-3 h-3 w-24" />
            </CardContent>
        </Card>
    );
}

export default function CasesPage() {
    const { cases, loading, error } = useCases();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [riskFilter, setRiskFilter] = useState("all");

    const filteredCases = useMemo(() => {
        return cases.filter((caseItem) => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    caseItem.caseId.toLowerCase().includes(query) ||
                    caseItem.title.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (statusFilter !== "all" && caseItem.status !== statusFilter) {
                return false;
            }

            // Risk filter
            if (riskFilter !== "all" && caseItem.riskLevel !== riskFilter) {
                return false;
            }

            return true;
        });
    }, [cases, searchQuery, statusFilter, riskFilter]);

    return (
        <>
            <Header title="Cases" description="Manage and analyze financial documents" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                        <WifiOffIcon className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Actions Bar */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search cases..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="analyzed">Analyzed</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={riskFilter} onValueChange={setRiskFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Risk Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button asChild>
                        <Link href="/cases/new">
                            <PlusIcon className="mr-2 h-4 w-4" />
                            Upload Document
                        </Link>
                    </Button>
                </div>

                {/* Cases Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        // Loading skeletons
                        Array.from({ length: 6 }).map((_, i) => (
                            <CaseCardSkeleton key={i} />
                        ))
                    ) : filteredCases.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                            <FileTextIcon className="h-12 w-12 text-muted-foreground/50" />
                            <h3 className="mt-4 text-lg font-semibold">No cases found</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {searchQuery || statusFilter !== "all" || riskFilter !== "all"
                                    ? "Try adjusting your filters"
                                    : "Upload a document to get started"}
                            </p>
                        </div>
                    ) : (
                        filteredCases.map((caseItem) => (
                            <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                                <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-base">{caseItem.caseId}</CardTitle>
                                                <CardDescription className="line-clamp-1">
                                                    {caseItem.title}
                                                </CardDescription>
                                            </div>
                                            <div
                                                className={cn(
                                                    "h-2 w-2 rounded-full mt-2",
                                                    statusColors[caseItem.status as keyof typeof statusColors]
                                                )}
                                            />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <FileTextIcon className="h-4 w-4" />
                                                <span>{caseItem.transactionCount.toLocaleString()} txns</span>
                                            </div>
                                            {caseItem.riskLevel ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold tabular-nums">
                                                        {caseItem.riskScore}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "capitalize",
                                                            riskBadgeVariants[caseItem.riskLevel as keyof typeof riskBadgeVariants]
                                                        )}
                                                    >
                                                        {caseItem.riskLevel}
                                                    </Badge>
                                                </div>
                                            ) : caseItem.status === "processing" ? (
                                                <Badge variant="secondary">Processing...</Badge>
                                            ) : (
                                                <Badge variant="destructive">Failed</Badge>
                                            )}
                                        </div>
                                        <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                            <CalendarIcon className="h-3 w-3" />
                                            <span>{caseItem.createdAt}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}

