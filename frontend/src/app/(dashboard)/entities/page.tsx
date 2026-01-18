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
import {
    SearchIcon,
    NetworkIcon,
} from "lucide-react";

export default function EntitiesPage() {
    return (
        <>
            <Header
                title="Entity Graph"
                description="Explore relationships between entities"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Search */}
                <div className="flex gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Search entities..." className="pl-9" />
                    </div>
                    <Button variant="outline">
                        <NetworkIcon className="mr-2 h-4 w-4" />
                        View Graph
                    </Button>
                </div>

                {/* Graph Placeholder */}
                <Card className="flex-1">
                    <CardHeader>
                        <CardTitle>Entity Relationship Graph</CardTitle>
                        <CardDescription>
                            Visual representation of entity connections
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
                            <div className="text-center">
                                <NetworkIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">
                                    Interactive graph visualization coming soon
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Will show entity connections and fraud networks
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Entity List */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Entities</CardTitle>
                        <CardDescription>
                            Vendors and companies detected in flagged transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                            <p>No entities detected yet</p>
                            <p className="text-sm">Entities will appear here when cases are analyzed</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
