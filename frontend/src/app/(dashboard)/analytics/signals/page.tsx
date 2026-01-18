import { Header } from "@/components/layout/header";
import { SignalDistributionChart } from "@/components/dashboard";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const signalDetails = [
    {
        name: "Benford's Law Deviation",
        description: "Detects unnatural patterns in first-digit distribution of amounts",
        triggered: 45,
        avgScore: 28.5,
        effectiveness: 94,
    },
    {
        name: "Statistical Outlier",
        description: "Identifies transactions deviating significantly from normal patterns",
        triggered: 38,
        avgScore: 22.3,
        effectiveness: 89,
    },
    {
        name: "Duplicate Transaction",
        description: "Finds potential duplicate payments to same vendor",
        triggered: 29,
        avgScore: 18.7,
        effectiveness: 96,
    },
    {
        name: "Vendor Concentration",
        description: "Flags when few vendors receive majority of payments",
        triggered: 24,
        avgScore: 24.1,
        effectiveness: 85,
    },
    {
        name: "Round Number Pattern",
        description: "Identifies suspicious patterns of round-number transactions",
        triggered: 18,
        avgScore: 15.2,
        effectiveness: 72,
    },
];

export default function SignalsPage() {
    return (
        <>
            <Header
                title="Signal Analysis"
                description="Deep dive into fraud detection signals"
            />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    <SignalDistributionChart />

                    <Card>
                        <CardHeader>
                            <CardTitle>Signal Effectiveness</CardTitle>
                            <CardDescription>
                                Detection accuracy by signal type
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {signalDetails.slice(0, 4).map((signal) => (
                                <div key={signal.name} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">{signal.name}</span>
                                        <span className="text-muted-foreground">{signal.effectiveness}%</span>
                                    </div>
                                    <Progress value={signal.effectiveness} className="h-2" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Signal Details</CardTitle>
                        <CardDescription>
                            All fraud detection signals with performance metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {signalDetails.map((signal) => (
                                <div
                                    key={signal.name}
                                    className="flex items-start justify-between rounded-lg border p-4"
                                >
                                    <div className="space-y-1">
                                        <h4 className="font-semibold">{signal.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {signal.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-right">
                                        <div>
                                            <p className="text-2xl font-bold">{signal.triggered}</p>
                                            <p className="text-xs text-muted-foreground">Triggered</p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold">{signal.avgScore}</p>
                                            <p className="text-xs text-muted-foreground">Avg Score</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                signal.effectiveness >= 90
                                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                                                    : signal.effectiveness >= 80
                                                        ? "border-amber-500/20 bg-amber-500/10 text-amber-500"
                                                        : "border-slate-500/20 bg-slate-500/10"
                                            }
                                        >
                                            {signal.effectiveness}% effective
                                        </Badge>
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
