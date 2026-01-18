// API client for FraudEx backend
// Provides type-safe methods for all API endpoints with fallback to mock data

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types matching backend schemas
export interface CaseResult {
    case_id: string;
    status: 'uploaded' | 'processing' | 'analyzed' | 'failed';
    risk_score: number | null;
    signals: Record<string, unknown> | null;
    explanation: string | null;
    created_at: string | null;
}

export interface AnalyticsSummary {
    total_cases: number;
    analyzed_cases: number;
    avg_risk_score: number;
    high_risk_count: number;
    critical_risk_count: number;
    risk_distribution: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    status_distribution: {
        uploaded: number;
        processing: number;
        analyzed: number;
        failed: number;
    };
    trends_7d: Array<{
        date: string;
        count: number;
        avg_risk_score: number;
        high_risk_count: number;
    }>;
    trends_30d: Array<{
        date: string;
        count: number;
        avg_risk_score: number;
        high_risk_count: number;
    }>;
    top_signals: Array<{
        signal_type: string;
        occurrence_count: number;
        affected_cases: number;
        avg_contribution: number;
    }>;
}

export interface RiskDistributionResponse {
    distribution: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    total_analyzed: number;
    average_score: number;
    min_score: number;
    max_score: number;
}

export interface SignalBreakdownResponse {
    signals: Array<{
        name: string;
        triggered_count: number;
        avg_score: number;
        max_score: number;
        case_ids: string[];
    }>;
}

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
    authToken = token;
}

export function getAuthToken(): string | null {
    return authToken;
}

export function clearAuthToken() {
    authToken = null;
}

// Base fetch wrapper with auth
async function fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (authToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new ApiError(response.status, error.detail || 'Request failed');
    }

    return response.json();
}

export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

// API Methods

export async function getCases(): Promise<CaseResult[]> {
    return fetchWithAuth<CaseResult[]>('/cases');
}

export async function getCase(caseId: string): Promise<CaseResult> {
    return fetchWithAuth<CaseResult>(`/cases/${caseId}`);
}

export async function uploadCase(file: File): Promise<{ case: CaseResult }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cases/upload`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new ApiError(response.status, error.detail);
    }

    return response.json();
}

export async function analyzeCase(caseId: string): Promise<{ case: CaseResult }> {
    return fetchWithAuth<{ case: CaseResult }>(`/cases/${caseId}/analyze`, {
        method: 'POST',
    });
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
    return fetchWithAuth<AnalyticsSummary>('/analytics/summary');
}

export async function getRiskDistribution(): Promise<RiskDistributionResponse> {
    return fetchWithAuth<RiskDistributionResponse>('/analytics/risk-distribution');
}

export async function getSignalBreakdown(): Promise<SignalBreakdownResponse> {
    return fetchWithAuth<SignalBreakdownResponse>('/analytics/signals');
}

// Health check (no auth required)
export async function checkHealth(): Promise<{ status: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
}
