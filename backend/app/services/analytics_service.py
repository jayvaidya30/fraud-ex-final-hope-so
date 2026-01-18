"""
Analytics service for dashboard aggregations and insights.
"""

from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from statistics import mean, median
from typing import Any

from app.schemas.analytics import (
    AnalyticsSummary,
    CohortAnalysis,
    DetectorStats,
    RiskDistribution,
    StatusDistribution,
    TopSignal,
    TrendPoint,
)


def classify_risk_level(score: int | None) -> str:
    """Classify numeric score into risk level."""
    if score is None:
        return "unknown"
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 25:
        return "medium"
    else:
        return "low"


def compute_analytics_summary(cases: list[dict[str, Any]]) -> AnalyticsSummary:
    """
    Compute analytics summary from a list of cases.

    Args:
        cases: List of case dicts with case_id, status, risk_score, signals, created_at

    Returns:
        AnalyticsSummary with aggregated metrics
    """
    now = datetime.now(timezone.utc)

    # Basic counts
    total_cases = len(cases)
    analyzed_cases = [c for c in cases if c.get("status") == "analyzed"]

    # Risk distribution
    risk_dist = RiskDistribution()
    risk_scores = []

    for case in analyzed_cases:
        score = case.get("risk_score")
        if score is not None:
            risk_scores.append(score)
            level = classify_risk_level(score)
            if level == "low":
                risk_dist.low += 1
            elif level == "medium":
                risk_dist.medium += 1
            elif level == "high":
                risk_dist.high += 1
            elif level == "critical":
                risk_dist.critical += 1

    avg_risk = mean(risk_scores) if risk_scores else 0.0

    # Status distribution
    status_dist = StatusDistribution()
    for case in cases:
        status = case.get("status", "uploaded")
        if status == "uploaded":
            status_dist.uploaded += 1
        elif status == "processing":
            status_dist.processing += 1
        elif status == "analyzed":
            status_dist.analyzed += 1
        elif status == "failed":
            status_dist.failed += 1

    # Time-based trends
    def parse_date(date_str: str | None) -> datetime | None:
        if not date_str:
            return None
        try:
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except (ValueError, TypeError):
            return None

    # Build 7-day and 30-day trends
    trends_7d = compute_trends(cases, now - timedelta(days=7), now)
    trends_30d = compute_trends(cases, now - timedelta(days=30), now, bucket_days=3)

    # Signal analysis
    signal_counts: Counter = Counter()
    signal_scores: defaultdict = defaultdict(list)
    signal_cases: defaultdict = defaultdict(set)

    for case in analyzed_cases:
        signals = case.get("signals") or {}
        detector_breakdown = signals.get("detector_breakdown", {})
        case_id = case.get("case_id", "")

        for detector_name, detector_data in detector_breakdown.items():
            if isinstance(detector_data, dict) and detector_data.get("score", 0) > 0:
                signal_counts[detector_name] += 1
                signal_scores[detector_name].append(detector_data.get("score", 0))
                signal_cases[detector_name].add(case_id)

    top_signals = []
    for signal_type, count in signal_counts.most_common(10):
        scores = signal_scores[signal_type]
        top_signals.append(TopSignal(
            signal_type=signal_type,
            occurrence_count=count,
            affected_cases=len(signal_cases[signal_type]),
            avg_contribution=mean(scores) if scores else 0.0,
            sample_case_ids=list(signal_cases[signal_type])[:5],
        ))

    # Detector stats
    detector_stats = []
    for detector_name in signal_counts.keys():
        scores = signal_scores[detector_name]
        detector_stats.append(DetectorStats(
            name=detector_name,
            triggered_count=signal_counts[detector_name],
            avg_score=mean(scores) if scores else 0.0,
            max_score=max(scores) if scores else 0.0,
            detection_rate=len(signal_cases[detector_name]) / len(analyzed_cases) if analyzed_cases else 0.0,
        ))

    # Sort by triggered count
    detector_stats.sort(key=lambda d: d.triggered_count, reverse=True)

    # Cohort analysis (by risk level)
    cohorts = []
    for level in ["low", "medium", "high", "critical"]:
        level_cases = [
            c for c in analyzed_cases
            if classify_risk_level(c.get("risk_score")) == level
        ]
        if level_cases:
            level_scores = [c.get("risk_score", 0) for c in level_cases]
            cohorts.append(CohortAnalysis(
                cohort_name=f"{level}_risk",
                case_count=len(level_cases),
                avg_risk_score=mean(level_scores),
                median_risk_score=median(level_scores),
                top_signals=_get_top_signals_for_cases(level_cases)[:3],
                risk_distribution=RiskDistribution(**{level: len(level_cases)}),
            ))

    # Recent high-risk cases
    recent_high_risk: list[str] = []
    for case in sorted(
        [c for c in analyzed_cases if (c.get("risk_score") or 0) >= 50],
        key=lambda c: c.get("created_at", ""),
        reverse=True,
    )[:10]:
        case_id = case.get("case_id")
        if isinstance(case_id, str) and case_id:
            recent_high_risk.append(case_id)

    return AnalyticsSummary(
        total_cases=total_cases,
        analyzed_cases=len(analyzed_cases),
        avg_risk_score=round(avg_risk, 1),
        high_risk_count=risk_dist.high + risk_dist.critical,
        critical_risk_count=risk_dist.critical,
        risk_distribution=risk_dist,
        status_distribution=status_dist,
        trends_7d=trends_7d,
        trends_30d=trends_30d,
        top_signals=top_signals,
        detector_stats=detector_stats,
        cohorts=cohorts,
        recent_high_risk_cases=recent_high_risk,
        pending_review_count=status_dist.processing + status_dist.uploaded,
        generated_at=now.isoformat(),
        period_start=(now - timedelta(days=30)).isoformat(),
        period_end=now.isoformat(),
    )


def compute_trends(
    cases: list[dict],
    start: datetime,
    end: datetime,
    bucket_days: int = 1,
) -> list[TrendPoint]:
    """Compute trend points for a date range."""
    trends = []
    current = start

    while current < end:
        bucket_end = current + timedelta(days=bucket_days)
        bucket_cases = [
            c for c in cases
            if _in_date_range(c.get("created_at"), current, bucket_end)
        ]

        analyzed_in_bucket = [
            c for c in bucket_cases
            if c.get("status") == "analyzed" and c.get("risk_score") is not None
        ]

        scores = [c.get("risk_score", 0) for c in analyzed_in_bucket]
        high_risk = [c for c in analyzed_in_bucket if (c.get("risk_score") or 0) >= 50]

        trends.append(TrendPoint(
            date=current.strftime("%Y-%m-%d"),
            count=len(bucket_cases),
            avg_risk_score=round(mean(scores), 1) if scores else 0.0,
            high_risk_count=len(high_risk),
        ))

        current = bucket_end

    return trends


def _in_date_range(date_str: str | None, start: datetime, end: datetime) -> bool:
    """Check if a date string falls within a range."""
    if not date_str:
        return False
    try:
        dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        return start <= dt < end
    except (ValueError, TypeError):
        return False


def _get_top_signals_for_cases(cases: list[dict]) -> list[str]:
    """Get top signal types for a list of cases."""
    signal_counts: Counter = Counter()

    for case in cases:
        signals = case.get("signals") or {}
        detector_breakdown = signals.get("detector_breakdown", {})

        for detector_name, detector_data in detector_breakdown.items():
            if isinstance(detector_data, dict) and detector_data.get("score", 0) > 0:
                signal_counts[detector_name] += 1

    return [name for name, _ in signal_counts.most_common(5)]
