"""
Analytics schemas for dashboard aggregations and insights.
"""

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class RiskDistribution(BaseModel):
    """Distribution of cases by risk level."""

    low: int = 0
    medium: int = 0
    high: int = 0
    critical: int = 0


class StatusDistribution(BaseModel):
    """Distribution of cases by status."""

    uploaded: int = 0
    processing: int = 0
    analyzed: int = 0
    failed: int = 0


class DetectorStats(BaseModel):
    """Statistics for a single detector."""

    name: str
    triggered_count: int = 0
    avg_score: float = 0.0
    max_score: float = 0.0
    detection_rate: float = 0.0  # % of cases where this detector triggered


class TrendPoint(BaseModel):
    """Single point in a time series trend."""

    date: str  # ISO date string
    count: int = 0
    avg_risk_score: float = 0.0
    high_risk_count: int = 0


class TopSignal(BaseModel):
    """A frequently occurring signal type."""

    signal_type: str
    occurrence_count: int
    affected_cases: int
    avg_contribution: float  # avg score contribution when present
    sample_case_ids: list[str] = Field(default_factory=list)


class CohortAnalysis(BaseModel):
    """Analysis of a case cohort (e.g., by time period, risk level)."""

    cohort_name: str
    case_count: int
    avg_risk_score: float
    median_risk_score: float
    top_signals: list[str] = Field(default_factory=list)
    risk_distribution: RiskDistribution = Field(default_factory=RiskDistribution)


class AnalyticsSummary(BaseModel):
    """Dashboard analytics summary."""

    # Overall metrics
    total_cases: int = 0
    analyzed_cases: int = 0
    avg_risk_score: float = 0.0
    high_risk_count: int = 0
    critical_risk_count: int = 0

    # Distributions
    risk_distribution: RiskDistribution = Field(default_factory=RiskDistribution)
    status_distribution: StatusDistribution = Field(default_factory=StatusDistribution)

    # Time-based trends
    trends_7d: list[TrendPoint] = Field(default_factory=list)
    trends_30d: list[TrendPoint] = Field(default_factory=list)

    # Signal analysis
    top_signals: list[TopSignal] = Field(default_factory=list)
    detector_stats: list[DetectorStats] = Field(default_factory=list)

    # Cohort analysis
    cohorts: list[CohortAnalysis] = Field(default_factory=list)

    # Recent activity
    recent_high_risk_cases: list[str] = Field(default_factory=list)
    pending_review_count: int = 0

    # Metadata
    generated_at: str = ""
    period_start: str | None = None
    period_end: str | None = None


class AlertRule(BaseModel):
    """Configuration for an alert rule."""

    id: str
    name: str
    enabled: bool = True
    condition_type: Literal["risk_threshold", "signal_pattern", "velocity", "custom"]
    threshold_value: float | None = None
    signal_types: list[str] = Field(default_factory=list)
    cooldown_minutes: int = 60
    notification_channels: list[str] = Field(default_factory=list)


class Alert(BaseModel):
    """Generated alert."""

    id: str
    rule_id: str
    case_id: str
    severity: Literal["info", "warning", "critical"]
    title: str
    description: str
    triggered_at: str
    acknowledged: bool = False
    acknowledged_by: str | None = None
    acknowledged_at: str | None = None


class AnalyticsFilters(BaseModel):
    """Filters for analytics queries."""

    start_date: str | None = None
    end_date: str | None = None
    risk_levels: list[str] = Field(default_factory=list)
    statuses: list[str] = Field(default_factory=list)
    signals: list[str] = Field(default_factory=list)
    min_risk_score: int | None = None
    max_risk_score: int | None = None
