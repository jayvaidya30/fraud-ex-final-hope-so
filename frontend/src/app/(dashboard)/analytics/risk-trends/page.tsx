import { Header } from "@/components/layout/header";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { RiskTrendsChart } from "@/components/dashboard";

export default function RiskTrendsPage() {
    return (
        <>
            <Header
                title="Risk Trends"
                description="Analyze risk score patterns over time"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="grid gap-6">
                    <RiskTrendsChart />

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Weekly Comparison</CardTitle>
                                <CardDescription>Risk trends week-over-week</CardDescription>
                            </CardHeader>
                            <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
                                Weekly comparison chart coming soon...
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Summary</CardTitle>
                                <CardDescription>Rolling 30-day risk analysis</CardDescription>
                            </CardHeader>
                            <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
                                Monthly summary chart coming soon...
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
