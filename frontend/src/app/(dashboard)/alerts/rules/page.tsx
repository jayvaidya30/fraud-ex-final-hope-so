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
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusIcon, TrashIcon, EditIcon } from "lucide-react";
import Link from "next/link";

const alertRules = [
    {
        id: "1",
        name: "Critical Risk Threshold",
        description: "Alert when case risk score exceeds 80",
        conditionType: "risk_threshold",
        threshold: 80,
        enabled: true,
        alertCount: 12,
    },
    {
        id: "2",
        name: "High Risk Cases",
        description: "Alert when case is classified as high risk",
        conditionType: "risk_threshold",
        threshold: 60,
        enabled: true,
        alertCount: 28,
    },
    {
        id: "3",
        name: "Vendor Concentration",
        description: "Alert when vendor concentration signal is detected",
        conditionType: "signal_pattern",
        signalTypes: ["Vendor Concentration"],
        enabled: true,
        alertCount: 8,
    },
    {
        id: "4",
        name: "Duplicate Transactions",
        description: "Alert on potential duplicate transaction detection",
        conditionType: "signal_pattern",
        signalTypes: ["Duplicate Detection"],
        enabled: false,
        alertCount: 0,
    },
];

export default function AlertRulesPage() {
    return (
        <>
            <Header
                title="Alert Rules"
                description="Configure automated alert triggers"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Actions */}
                <div className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/alerts">← Back to Alerts</Link>
                    </Button>
                    <Button>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Create Rule
                    </Button>
                </div>

                {/* Rules List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Rules</CardTitle>
                        <CardDescription>
                            Rules that trigger alerts based on defined conditions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {alertRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="flex items-start justify-between rounded-lg border p-4"
                                >
                                    <div className="flex items-start gap-4">
                                        <Switch checked={rule.enabled} />
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{rule.name}</h4>
                                                <Badge variant="outline">
                                                    {rule.conditionType === "risk_threshold"
                                                        ? `Score ≥ ${rule.threshold}`
                                                        : "Signal Pattern"}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {rule.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {rule.alertCount} alerts triggered
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon">
                                            <EditIcon className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive">
                                            <TrashIcon className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Create Rule Form (Preview) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Rule Creator</CardTitle>
                        <CardDescription>
                            Set up a new alert rule
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Rule Name</Label>
                                <Input placeholder="e.g., High Value Transactions" />
                            </div>
                            <div className="space-y-2">
                                <Label>Risk Threshold</Label>
                                <Input type="number" placeholder="70" />
                            </div>
                        </div>
                        <Button className="w-full" variant="outline">
                            Create Alert Rule
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
