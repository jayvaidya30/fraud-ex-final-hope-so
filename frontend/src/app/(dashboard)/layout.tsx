"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { Loader2Icon } from "lucide-react";

function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading, isConfigured } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Only redirect if Supabase is configured and user is not logged in
        if (isConfigured && !loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router, isConfigured]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // If Supabase is not configured, allow access (demo mode)
    if (!isConfigured) {
        return <>{children}</>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return <>{children}</>;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <AuthGuard>
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            </AuthGuard>
        </AuthProvider>
    );
}

