"use client";

import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BellIcon,
    AlertTriangleIcon,
    XCircleIcon,
    SettingsIcon,
} from "lucide-react";
import Link from "next/link";

export default function AlertsPage() {
    return (
        <>
            <Header
                title="Alerts"
                description="Monitor fraud detection alerts"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Alerts</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <BellIcon className="h-8 w-8 text-muted-foreground" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Unacknowledged</p>
                                    <p className="text-2xl font-bold text-red-500">0</p>
                                </div>
                                <AlertTriangleIcon className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Critical</p>
                                    <p className="text-2xl font-bold">0</p>
                                </div>
                                <XCircleIcon className="h-8 w-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex items-center justify-center">
                            <Button variant="outline" asChild>
                                <Link href="/alerts/rules">
                                    <SettingsIcon className="mr-2 h-4 w-4" />
                                    Configure Rules
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts Tabs */}
                <Tabs defaultValue="all">
                    <TabsList>
                        <TabsTrigger value="all">All Alerts</TabsTrigger>
                        <TabsTrigger value="unacknowledged">
                            Unacknowledged (0)
                        </TabsTrigger>
                        <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Alerts</CardTitle>
                                <CardDescription>
                                    All alerts from the past 7 days
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                    <BellIcon className="h-12 w-12 mb-4" />
                                    <p>No alerts yet</p>
                                    <p className="text-sm">Alerts will appear here when fraud signals are detected</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="unacknowledged" className="mt-6">
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No unacknowledged alerts
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="acknowledged" className="mt-6">
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No acknowledged alerts
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
