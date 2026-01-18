"use client";

import { useParams } from "next/navigation";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowLeftIcon,
    FileTextIcon,
    AlertTriangleIcon,
    DownloadIcon,
    RefreshCwIcon,
    WifiOffIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    RiskTrendsChart,
    SignalDistributionChart,
} from "@/components/dashboard";
import { useCaseDetail } from "@/hooks/use-cases";
import Markdown from "react-markdown";

const riskColors = {
    low: "text-emerald-500",
    medium: "text-amber-500",
    high: "text-orange-500",
    critical: "text-red-500",
};

function CaseDetailSkeleton() {
    return (
        <>
            <Header title="Loading..." description="Loading case details" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-10 w-32" />
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-28" />
                        <Skeleton className="h-10 w-32" />
                    </div>
                </div>
                <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <Skeleton className="h-16 w-48 bg-white/20" />
                            <div className="grid grid-cols-3 gap-8">
                                <Skeleton className="h-12 w-20 bg-white/20" />
                                <Skeleton className="h-12 w-24 bg-white/20" />
                                <Skeleton className="h-12 w-16 bg-white/20" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Skeleton className="h-[400px] w-full" />
            </div>
        </>
    );
}

export default function CaseDetailPage() {
    const params = useParams();
    const caseId = params.id as string;
    const { caseDetail, loading, error } = useCaseDetail(caseId);

    if (loading) {
        return <CaseDetailSkeleton />;
    }

    if (!caseDetail) {
        return (
            <>
                <Header title="Case Not Found" description="The requested case could not be found" />
                <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
                    <FileTextIcon className="h-16 w-16 text-muted-foreground/50" />
                    <h2 className="text-xl font-semibold">Case Not Found</h2>
                    <p className="text-muted-foreground">The case with ID &ldquo;{caseId}&rdquo; does not exist.</p>
                    <Button asChild>
                        <Link href="/cases">Back to Cases</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header title={caseDetail.caseId} description={caseDetail.title} />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Error message */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                        <WifiOffIcon className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Back Button + Actions */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild>
                        <Link href="/cases">
                            <ArrowLeftIcon className="mr-2 h-4 w-4" />
                            Back to Cases
                        </Link>
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline">
                            <RefreshCwIcon className="mr-2 h-4 w-4" />
                            Re-analyze
                        </Button>
                        <Button variant="outline">
                            <DownloadIcon className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                    </div>
                </div>

                {/* Risk Score Hero */}
                <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-5xl font-bold">{caseDetail.riskScore}</span>
                                    <Badge
                                        variant="outline"
                                        className={cn(
                                            "text-lg capitalize border-current",
                                            riskColors[caseDetail.riskLevel as keyof typeof riskColors]
                                        )}
                                    >
                                        {caseDetail.riskLevel} Risk
                                    </Badge>
                                </div>
                                <p className="text-slate-300">
                                    Analyzed on {new Date(caseDetail.analyzedAt).toLocaleString()}
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-8 text-center">
                                <div>
                                    <p className="text-3xl font-bold">{caseDetail.transactionCount.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Transactions</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">${caseDetail.totalAmount.toLocaleString()}</p>
                                    <p className="text-sm text-slate-400">Total Amount</p>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-red-400">{caseDetail.flaggedCount}</p>
                                    <p className="text-sm text-slate-400">Flagged</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="signals">Signals</TabsTrigger>
                        <TabsTrigger value="transactions">Flagged Transactions</TabsTrigger>
                        <TabsTrigger value="charts">Charts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-6">
                        {/* AI Explanation */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                                    Risk Assessment Explanation
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[400px] pr-4">
                                    <div className="prose prose-sm dark:prose-invert max-w-none">
                                        <Markdown
                                            components={{
                                                h1: ({ children }) => <h2 className="text-xl font-bold mt-4 mb-2">{children}</h2>,
                                                h2: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                                                h3: ({ children }) => <h4 className="text-base font-semibold mt-3 mb-1">{children}</h4>,
                                                p: ({ children }) => <p className="text-muted-foreground mb-3 leading-relaxed">{children}</p>,
                                                ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                                ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                                li: ({ children }) => <li className="text-muted-foreground">{children}</li>,
                                                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                                code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-sm">{children}</code>,
                                            }}
                                        >
                                            {caseDetail.explanation}
                                        </Markdown>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Signal Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detection Signals</CardTitle>
                                <CardDescription>
                                    Breakdown of risk score by detection method
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {caseDetail.signals.length === 0 ? (
                                    <p className="text-muted-foreground">No signals detected.</p>
                                ) : (
                                    caseDetail.signals.map((signal, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium">{signal.type}</span>
                                                <span className="font-bold">{signal.score}</span>
                                            </div>
                                            <Progress value={(signal.score / 50) * 100} className="h-2" />
                                            <p className="text-sm text-muted-foreground">{signal.description}</p>
                                            {index < caseDetail.signals.length - 1 && <Separator className="mt-4" />}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="signals" className="mt-6">
                        <SignalDistributionChart />
                    </TabsContent>

                    <TabsContent value="transactions" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Flagged Transactions</CardTitle>
                                <CardDescription>
                                    Transactions requiring investigation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {caseDetail.flaggedTransactions.length === 0 ? (
                                    <p className="text-muted-foreground py-8 text-center">
                                        No flagged transactions for this case.
                                    </p>
                                ) : (
                                    <ScrollArea className="h-[400px]">
                                        <div className="space-y-4">
                                            {caseDetail.flaggedTransactions.map((txn) => (
                                                <div
                                                    key={txn.id}
                                                    className="flex items-center justify-between rounded-lg border p-4"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm">{txn.id}</span>
                                                            <Badge variant="outline">{txn.vendor}</Badge>
                                                            <span className="text-xs text-muted-foreground">{txn.date}</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{txn.reason}</p>
                                                    </div>
                                                    <span className="text-xl font-bold">
                                                        ${txn.amount.toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="charts" className="mt-6">
                        <RiskTrendsChart />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

