"use client";

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
import { Progress } from "@/components/ui/progress";
import { SearchIcon, Building2Icon, AlertTriangleIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const vendors = [
    {
        id: "1",
        name: "ABC Corporation",
        totalTransactions: 245,
        totalAmount: 1256780,
        riskScore: 78,
        riskLevel: "high",
        signals: ["Concentration", "Round Numbers"],
    },
    {
        id: "2",
        name: "XYZ Technologies Ltd",
        totalTransactions: 189,
        totalAmount: 892450,
        riskScore: 65,
        riskLevel: "high",
        signals: ["Benford Deviation"],
    },
    {
        id: "3",
        name: "Global Services Inc",
        totalTransactions: 312,
        totalAmount: 1567890,
        riskScore: 45,
        riskLevel: "medium",
        signals: ["Split Transactions"],
    },
    {
        id: "4",
        name: "Metro Supplies Co",
        totalTransactions: 156,
        totalAmount: 423560,
        riskScore: 32,
        riskLevel: "medium",
        signals: [],
    },
    {
        id: "5",
        name: "Premier Consulting Group",
        totalTransactions: 78,
        totalAmount: 234500,
        riskScore: 12,
        riskLevel: "low",
        signals: [],
    },
];

const riskColors = {
    low: "text-emerald-500",
    medium: "text-amber-500",
    high: "text-orange-500",
    critical: "text-red-500",
};

const riskBadgeVariants = {
    low: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function VendorsPage() {
    return (
        <>
            <Header
                title="Vendor Analysis"
                description="Risk assessment by vendor"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search vendors..." className="pl-9" />
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/10">
                                    <Building2Icon className="h-5 w-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{vendors.length}</p>
                                    <p className="text-sm text-muted-foreground">Total Vendors</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                                    <AlertTriangleIcon className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">
                                        {vendors.filter((v) => v.riskLevel === "high").length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">High Risk</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div>
                                <p className="text-2xl font-bold">
                                    ${(vendors.reduce((sum, v) => sum + v.totalAmount, 0) / 1000000).toFixed(2)}M
                                </p>
                                <p className="text-sm text-muted-foreground">Total Payments</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div>
                                <p className="text-2xl font-bold">
                                    {vendors.reduce((sum, v) => sum + v.totalTransactions, 0)}
                                </p>
                                <p className="text-sm text-muted-foreground">Transactions</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Vendor List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Vendor Risk Rankings</CardTitle>
                        <CardDescription>
                            Sorted by risk score (highest first)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {vendors
                                .sort((a, b) => b.riskScore - a.riskScore)
                                .map((vendor) => (
                                    <div
                                        key={vendor.id}
                                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted font-bold text-lg">
                                                {vendor.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold">{vendor.name}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {vendor.totalTransactions} transactions · $
                                                    {(vendor.totalAmount / 1000).toFixed(0)}K total
                                                </p>
                                                {vendor.signals.length > 0 && (
                                                    <div className="mt-1 flex gap-1">
                                                        {vendor.signals.map((signal) => (
                                                            <Badge key={signal} variant="secondary" className="text-xs">
                                                                {signal}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={cn("text-2xl font-bold", riskColors[vendor.riskLevel as keyof typeof riskColors])}>
                                                    {vendor.riskScore}
                                                </p>
                                                <Badge
                                                    variant="outline"
                                                    className={cn("capitalize", riskBadgeVariants[vendor.riskLevel as keyof typeof riskBadgeVariants])}
                                                >
                                                    {vendor.riskLevel}
                                                </Badge>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
