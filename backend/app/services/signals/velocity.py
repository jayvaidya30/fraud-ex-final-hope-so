"""
Velocity / frequency anomaly detector.

Detects unusual patterns in transaction or activity frequency:
- Sudden spikes in activity
- Unusual timing (after hours, weekends)
- Clustering of transactions
"""

import re
from collections import Counter
from datetime import datetime
from typing import Any

from .base import AnalysisContext, BaseDetector, SignalResult


def extract_dates(text: str) -> list[dict[str, Any]]:
    """
    Extract dates from text in various formats.
    """
    dates = []

    # Common date patterns
    patterns = [
        # MM/DD/YYYY or MM-DD-YYYY
        (r'\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b', 'MDY'),
        # YYYY-MM-DD
        (r'\b(\d{4})-(\d{1,2})-(\d{1,2})\b', 'YMD'),
        # Month DD, YYYY
        (r'\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})\b', 'MnDY'),
        # DD Month YYYY
        (r'\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})\b', 'DMnY'),
    ]

    month_map = {
        'jan': 1, 'feb': 2, 'mar': 3, 'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'dec': 12
    }

    for pattern, fmt in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            try:
                groups = match.groups()
                if fmt == 'MDY':
                    month, day, year = int(groups[0]), int(groups[1]), int(groups[2])
                elif fmt == 'YMD':
                    year, month, day = int(groups[0]), int(groups[1]), int(groups[2])
                elif fmt == 'MnDY':
                    month = month_map.get(groups[0].lower()[:3], 0)
                    day, year = int(groups[1]), int(groups[2])
                elif fmt == 'DMnY':
                    day = int(groups[0])
                    month = month_map.get(groups[1].lower()[:3], 0)
                    year = int(groups[2])
                else:
                    continue

                if 1 <= month <= 12 and 1 <= day <= 31 and 1900 <= year <= 2100:
                    dt = datetime(year, month, day)
                    dates.append({
                        "date": dt,
                        "raw": match.group(0),
                        "day_of_week": dt.strftime("%A"),
                        "is_weekend": dt.weekday() >= 5,
                    })
            except (ValueError, IndexError):
                continue

    return dates


def analyze_date_patterns(dates: list[dict]) -> dict[str, Any]:
    """
    Analyze dates for suspicious patterns.
    """
    if len(dates) < 2:
        return {"patterns": [], "risk_indicators": []}

    patterns = []
    risk_indicators = []

    # Check weekend activity
    weekend_dates = [d for d in dates if d["is_weekend"]]
    weekend_ratio = len(weekend_dates) / len(dates)

    if weekend_ratio > 0.3:
        patterns.append("high_weekend_activity")
        risk_indicators.append({
            "type": "high_weekend_activity",
            "description": f"{len(weekend_dates)}/{len(dates)} ({weekend_ratio:.0%}) dates are weekends",
            "severity": "medium" if weekend_ratio > 0.5 else "low",
        })

    # Check for date clustering (multiple transactions same day)
    date_strs = [d["date"].strftime("%Y-%m-%d") for d in dates]
    date_counts = Counter(date_strs)
    clustered_days = [(d, c) for d, c in date_counts.items() if c >= 3]

    if clustered_days:
        patterns.append("date_clustering")
        risk_indicators.append({
            "type": "date_clustering",
            "description": f"Multiple entries on same day: {clustered_days[:3]}",
            "severity": "medium",
        })

    # Check for month-end clustering
    month_end_dates = [d for d in dates if d["date"].day >= 28]
    if len(month_end_dates) > len(dates) * 0.4:
        patterns.append("month_end_clustering")
        risk_indicators.append({
            "type": "month_end_clustering",
            "description": f"{len(month_end_dates)}/{len(dates)} dates are month-end",
            "severity": "low",
        })

    return {
        "patterns": patterns,
        "risk_indicators": risk_indicators,
        "total_dates": len(dates),
        "unique_dates": len(set(date_strs)),
        "weekend_ratio": round(weekend_ratio, 3),
    }


class VelocityDetector(BaseDetector):
    """
    Detects velocity and timing anomalies.

    Looks for unusual patterns in when activities occur:
    - High weekend activity
    - Clustering of transactions on specific dates
    - Month-end anomalies (common for fraudulent entries)
    """

    name = "velocity"
    default_weight = 0.8
    description = "Transaction velocity and timing anomaly detection"

    def detect(self, context: AnalysisContext) -> SignalResult:
        # Extract dates from text
        dates = extract_dates(context.text)

        # Add pre-extracted dates
        for date_str in context.dates:
            try:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                dates.append({
                    "date": dt,
                    "raw": date_str,
                    "day_of_week": dt.strftime("%A"),
                    "is_weekend": dt.weekday() >= 5,
                })
            except (ValueError, TypeError):
                continue

        if len(dates) < 2:
            return self._make_result(
                score=0,
                indicators={"dates_found": len(dates)},
                explanation="Insufficient date data for velocity analysis.",
                confidence=0.4,
            )

        # Analyze patterns
        analysis = analyze_date_patterns(dates)

        patterns = analysis["patterns"]
        indicators = analysis["risk_indicators"]

        score = 0.0
        confidence = 0.5

        # Score based on patterns
        for indicator in indicators:
            if indicator["severity"] == "high":
                score += 15
            elif indicator["severity"] == "medium":
                score += 10
            else:
                score += 5
            confidence += 0.1

        score = min(score, 30)
        confidence = min(confidence, 0.8)

        # Build explanation
        if patterns:
            pattern_descs = [ind["description"] for ind in indicators]
            explanation = (
                f"Timing anomalies detected: {', '.join(patterns)}. "
                + "; ".join(pattern_descs[:3]) + "."
            )
        else:
            explanation = "No significant timing anomalies detected."

        return self._make_result(
            score=score,
            indicators={
                "dates_analyzed": len(dates),
                "unique_dates": analysis["unique_dates"],
                "weekend_ratio": analysis["weekend_ratio"],
                "patterns_detected": patterns,
                "risk_indicators": indicators,
            },
            explanation=explanation,
            confidence=confidence,
        )
