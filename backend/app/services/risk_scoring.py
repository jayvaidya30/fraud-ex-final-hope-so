"""
Risk scoring module.

Computes multi-dimensional risk scores using the signal engine ensemble.
Provides backward-compatible interface while leveraging advanced detectors.
"""

from typing import Any

from app.services.signals import SignalEngine
from app.services.signals.base import AnalysisContext


def compute_risk_score(text: str) -> tuple[int, dict, str]:
    """
    Computes a risk score (0-100) using signal engine ensemble.

    Returns: (score, signals_dict, explanation)

    The signals_dict includes:
    - risk_level: low/medium/high/critical
    - confidence: 0-1 confidence in the assessment
    - top_factors: list of top contributing factors with explanations
    - recommendations: actionable next steps
    - detector_breakdown: per-detector results
    """
    context = AnalysisContext(text=text)
    engine = SignalEngine()
    result = engine.analyze(context)

    signals: dict[str, Any] = {
        "risk_level": result.risk_level,
        "confidence": result.confidence,
        "top_factors": result.top_factors,
        "recommendations": result.recommendations,
        "detectors_triggered": result.signals.get("detectors_triggered", 0),
        "detector_breakdown": result.signals.get("detector_breakdown", {}),
    }

    return result.risk_score, signals, result.explanation


def compute_risk_score_detailed(
    text: str,
    amounts: list[float] | None = None,
    dates: list[str] | None = None,
    entities: list[dict] | None = None,
    relationships: list[dict] | None = None,
    metadata: dict | None = None,
) -> dict[str, Any]:
    """
    Computes detailed risk assessment with additional context.

    Args:
        text: Document text content
        amounts: Pre-extracted monetary amounts
        dates: Pre-extracted dates (ISO format)
        entities: Entity list (vendors, people, companies)
        relationships: Relationship data for graph analysis
        metadata: Additional context (document type, source, etc.)

    Returns:
        Detailed risk assessment dict including:
        - risk_score: 0-100
        - risk_level: low/medium/high/critical
        - confidence: 0-1
        - explanation: Human-readable explanation
        - top_factors: Contributing factors with explanations
        - recommendations: Actionable next steps
        - full_analysis: Complete detector results
    """
    context = AnalysisContext(
        text=text,
        amounts=amounts or [],
        dates=dates or [],
        entities=entities or [],
        relationships=relationships or [],
        metadata=metadata or {},
    )

    engine = SignalEngine()
    result = engine.analyze(context)

    return {
        "risk_score": result.risk_score,
        "risk_level": result.risk_level,
        "confidence": result.confidence,
        "explanation": result.explanation,
        "top_factors": result.top_factors,
        "recommendations": result.recommendations,
        "signals": result.signals,
        "full_analysis": {
            "detectors_run": len(result.detector_results),
            "detector_results": [
                {
                    "name": r.detector_name,
                    "score": r.score,
                    "weight": r.weight,
                    "confidence": r.confidence,
                    "explanation": r.explanation,
                    "indicators": r.indicators,
                }
                for r in result.detector_results
            ],
        },
    }
