"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheckIcon, Loader2Icon, AlertCircleIcon, CheckCircleIcon } from "lucide-react";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        const { error } = await signUp(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                            <CheckCircleIcon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">
                        Check your email
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                        We&apos;ve sent you a confirmation link. Please check your inbox and click the link to activate your account.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                    <Link
                        href="/login"
                        className="text-emerald-400 hover:text-emerald-300 hover:underline"
                    >
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-xl">
            <CardHeader className="space-y-1 text-center">
                <div className="mb-4 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                        <ShieldCheckIcon className="h-6 w-6 text-white" />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                    Create an account
                </CardTitle>
                <CardDescription className="text-slate-400">
                    Get started with FraudEx
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                            <AlertCircleIcon className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-200">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-200">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-200">
                            Confirm Password
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
                        )}
                    </Button>
                    <p className="text-sm text-slate-400">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-emerald-400 hover:text-emerald-300 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    );
}
