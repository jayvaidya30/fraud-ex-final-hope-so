import { AuthProvider } from "@/contexts/auth-context";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
                {children}
            </div>
        </AuthProvider>
    );
}

