"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getCases,
    getCase,
    ApiError,
    type CaseResult,
} from "@/services/api";

// Types for frontend use
export interface Case {
    id: string;
    caseId: string;
    title: string;
    status: "uploaded" | "processing" | "analyzed" | "failed";
    riskLevel: "low" | "medium" | "high" | "critical";
    riskScore: number;
    createdAt: string;
    transactionCount: number;
    totalAmount?: number;
    flaggedCount?: number;
}

export interface CaseDetail {
    id: string;
    caseId: string;
    title: string;
    status: string;
    riskLevel: string;
    riskScore: number;
    createdAt: string;
    analyzedAt: string;
    transactionCount: number;
    totalAmount: number;
    flaggedCount: number;
    explanation: string;
    signals: Array<{ type: string; score: number; description: string }>;
    flaggedTransactions: Array<{ id: string; amount: number; vendor: string; reason: string; date: string }>;
}

// Convert API case to frontend Case type
function apiCaseToFrontend(apiCase: CaseResult): Case {
    const riskScore = apiCase.risk_score ?? 0;
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    if (riskScore >= 75) riskLevel = "critical";
    else if (riskScore >= 50) riskLevel = "high";
    else if (riskScore >= 25) riskLevel = "medium";

    // Extract transaction count from signals if available
    const signals = apiCase.signals as Record<string, unknown> | null;
    const transactionCount = (signals?.transaction_count as number) ?? 1;

    return {
        id: apiCase.case_id,
        caseId: apiCase.case_id,
        title: apiCase.explanation ?? "Pending analysis",
        status: apiCase.status,
        riskLevel,
        riskScore,
        createdAt: apiCase.created_at ?? new Date().toISOString(),
        transactionCount,
    };
}

export interface UseCasesReturn {
    cases: Case[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCases(): UseCasesReturn {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const apiCases = await getCases();
            setCases(apiCases.map(apiCaseToFrontend));
        } catch (err) {
            console.error("Failed to fetch cases:", err);
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Please log in to view cases.");
                } else {
                    setError(err.message || "Failed to load cases.");
                }
            } else {
                setError("Failed to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    return { cases, loading, error, refetch: fetchCases };
}

export interface UseCaseDetailReturn {
    caseDetail: CaseDetail | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCaseDetail(caseId: string): UseCaseDetailReturn {
    const [caseDetail, setCaseDetail] = useState<CaseDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCaseDetail = useCallback(async () => {
        if (!caseId) return;

        // Don't show loading spinner on poll refetches
        if (!caseDetail) {
            setLoading(true);
        }
        setError(null);

        try {
            const apiCase = await getCase(caseId);

            // Convert API response to CaseDetail format
            const signals = apiCase.signals as Record<string, unknown> | null;
            const detectorBreakdown = (signals?.detector_breakdown ?? {}) as Record<
                string,
                { score: number; triggered: boolean; explanation?: string }
            >;

            const detail: CaseDetail = {
                id: apiCase.case_id,
                caseId: apiCase.case_id,
                title: apiCase.explanation?.split(".")[0] ?? "Case Analysis",
                status: apiCase.status,
                riskLevel: apiCase.risk_score !== null && apiCase.risk_score >= 75
                    ? "critical"
                    : apiCase.risk_score !== null && apiCase.risk_score >= 50
                        ? "high"
                        : apiCase.risk_score !== null && apiCase.risk_score >= 25
                            ? "medium"
                            : "low",
                riskScore: apiCase.risk_score ?? 0,
                createdAt: apiCase.created_at ?? new Date().toISOString(),
                analyzedAt: apiCase.created_at ?? new Date().toISOString(),
                transactionCount: (signals?.transaction_count as number) ?? 1,
                totalAmount: (signals?.total_amount as number) ?? 0,
                flaggedCount: (signals?.flagged_count as number) ?? 0,
                explanation: apiCase.explanation ?? "No explanation available",
                signals: Object.entries(detectorBreakdown).map(([type, data]) => ({
                    type,
                    score: data.score,
                    description: data.explanation ?? `${type} detected`,
                })),
                flaggedTransactions: [],
            };

            setCaseDetail(detail);
        } catch (err) {
            console.error("Failed to fetch case detail:", err);
            if (err instanceof ApiError) {
                if (err.status === 401) {
                    setError("Please log in to view case details.");
                } else if (err.status === 404) {
                    setError("Case not found.");
                } else {
                    setError(err.message || "Failed to load case details.");
                }
            } else {
                setError("Failed to connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    }, [caseId, caseDetail]);

    useEffect(() => {
        fetchCaseDetail();
    }, [caseId]); // Only fetch on mount or caseId change

    // Auto-poll when status is processing
    useEffect(() => {
        if (caseDetail?.status === "processing" || caseDetail?.status === "uploaded") {
            const pollInterval = setInterval(() => {
                fetchCaseDetail();
            }, 3000); // Poll every 3 seconds

            return () => clearInterval(pollInterval);
        }
    }, [caseDetail?.status, fetchCaseDetail]);

    return { caseDetail, loading, error, refetch: fetchCaseDetail };
}

