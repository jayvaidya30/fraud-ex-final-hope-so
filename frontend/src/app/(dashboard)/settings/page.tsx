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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { BellIcon, PaletteIcon, ShieldIcon, DatabaseIcon } from "lucide-react";

export default function SettingsPage() {
    return (
        <>
            <Header
                title="Settings"
                description="Configure application preferences"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-4">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="notifications">Alerts</TabsTrigger>
                        <TabsTrigger value="appearance">Display</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>General Settings</CardTitle>
                                <CardDescription>
                                    Basic application configuration
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label>Organization Name</Label>
                                        <Input defaultValue="Acme Corporation" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Default Currency</Label>
                                        <Select defaultValue="usd">
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="usd">USD ($)</SelectItem>
                                                <SelectItem value="eur">EUR (€)</SelectItem>
                                                <SelectItem value="gbp">GBP (£)</SelectItem>
                                                <SelectItem value="inr">INR (₹)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Label>Time Zone</Label>
                                    <Select defaultValue="ist">
                                        <SelectTrigger className="max-w-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ist">Asia/Kolkata (IST)</SelectItem>
                                            <SelectItem value="utc">UTC</SelectItem>
                                            <SelectItem value="est">America/New_York (EST)</SelectItem>
                                            <SelectItem value="pst">America/Los_Angeles (PST)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button>Save Changes</Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <BellIcon className="h-5 w-5" />
                                    <CardTitle>Alert Preferences</CardTitle>
                                </div>
                                <CardDescription>
                                    Configure how you receive alerts
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Email Notifications</p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive alerts via email
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Configure</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Critical Alerts Only</p>
                                        <p className="text-sm text-muted-foreground">
                                            Only notify for critical risk scores
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Configure</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Daily Digest</p>
                                        <p className="text-sm text-muted-foreground">
                                            Receive a daily summary email
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm">Configure</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <PaletteIcon className="h-5 w-5" />
                                    <CardTitle>Appearance</CardTitle>
                                </div>
                                <CardDescription>
                                    Customize the look and feel
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Theme</Label>
                                    <Select defaultValue="system">
                                        <SelectTrigger className="max-w-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="light">Light</SelectItem>
                                            <SelectItem value="dark">Dark</SelectItem>
                                            <SelectItem value="system">System</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Dashboard Layout</Label>
                                    <Select defaultValue="default">
                                        <SelectTrigger className="max-w-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="default">Default (Bento Grid)</SelectItem>
                                            <SelectItem value="compact">Compact</SelectItem>
                                            <SelectItem value="expanded">Expanded</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="data" className="mt-6 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <DatabaseIcon className="h-5 w-5" />
                                    <CardTitle>Data Management</CardTitle>
                                </div>
                                <CardDescription>
                                    Manage your data and exports
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Export All Data</p>
                                        <p className="text-sm text-muted-foreground">
                                            Download all cases and analysis results
                                        </p>
                                    </div>
                                    <Button variant="outline">Export</Button>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div>
                                        <p className="font-medium">Data Retention</p>
                                        <p className="text-sm text-muted-foreground">
                                            Configure how long data is kept
                                        </p>
                                    </div>
                                    <Select defaultValue="1year">
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="30days">30 Days</SelectItem>
                                            <SelectItem value="90days">90 Days</SelectItem>
                                            <SelectItem value="1year">1 Year</SelectItem>
                                            <SelectItem value="forever">Forever</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}
