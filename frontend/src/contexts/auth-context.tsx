"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "@/services/supabase";
import { setAuthToken, clearAuthToken } from "@/services/api";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isConfigured: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const isConfigured = isSupabaseConfigured();

    const supabase = isConfigured ? getSupabaseClient() : null;

    // Sync session token with API client
    const syncToken = useCallback((session: Session | null) => {
        if (session?.access_token) {
            setAuthToken(session.access_token);
        } else {
            clearAuthToken();
        }
    }, []);

    useEffect(() => {
        if (!supabase) {
            // Supabase not configured - skip auth
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            syncToken(session);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: string, session: Session | null) => {
                setSession(session);
                setUser(session?.user ?? null);
                syncToken(session);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase, syncToken]);

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            return { error: new Error("Supabase not configured") };
        }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (email: string, password: string) => {
        if (!supabase) {
            return { error: new Error("Supabase not configured") };
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        clearAuthToken();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, isConfigured, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

