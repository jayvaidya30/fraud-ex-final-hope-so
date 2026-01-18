"""
Signal Engine: orchestrates all detectors and aggregates results.

The engine runs all configured detectors, weights their outputs,
and produces a unified risk assessment with explainable factors.
"""

from dataclasses import dataclass, field
from typing import Any

from .base import AnalysisContext, BaseDetector, SignalResult
from .benford import BenfordDetector
from .round_numbers import RoundNumberDetector
from .split_invoice import SplitInvoiceDetector
from .bid_rigging import BidRiggingDetector
from .keywords import KeywordDetector
from .urgency import UrgencyDetector
from .velocity import VelocityDetector


@dataclass
class AggregatedRiskResult:
    """Aggregated result from all detectors."""

    risk_score: int  # 0-100
    risk_level: str  # low, medium, high, critical
    confidence: float  # 0-1
    signals: dict[str, Any]
    explanation: str
    top_factors: list[dict[str, Any]]
    detector_results: list[SignalResult]
    recommendations: list[str] = field(default_factory=list)


def classify_risk_level(score: int) -> str:
    """Classify numeric score into risk level."""
    if score >= 75:
        return "critical"
    elif score >= 50:
        return "high"
    elif score >= 25:
        return "medium"
    else:
        return "low"


def generate_recommendations(top_factors: list[dict], risk_level: str) -> list[str]:
    """Generate actionable recommendations based on findings."""
    recommendations = []

    factor_types = [f["detector"] for f in top_factors]

    if "benford" in factor_types:
        recommendations.append(
            "Verify numerical data sources and check for potential data entry errors or manipulation."
        )

    if "split_invoice" in factor_types:
        recommendations.append(
            "Review related invoices for potential unauthorized splitting to avoid approval thresholds."
        )

    if "bid_rigging" in factor_types:
        recommendations.append(
            "Investigate vendor relationships and review bidding history for potential collusion."
        )

    if "round_numbers" in factor_types:
        recommendations.append(
            "Request supporting documentation for round-number amounts; verify against actual costs."
        )

    if "keywords" in factor_types:
        recommendations.append(
            "Escalate for legal/compliance review due to concerning language patterns."
        )

    if "urgency" in factor_types:
        recommendations.append(
            "Maintain normal approval process despite urgency pressure; verify legitimacy of deadlines."
        )

    if "velocity" in factor_types:
        recommendations.append(
            "Review timing patterns; consider whether after-hours/weekend activity is justified."
        )

    # General recommendations based on risk level
    if risk_level in ("high", "critical"):
        recommendations.insert(0, "Flag for immediate supervisor review before any approval.")
        recommendations.append("Consider forensic audit of related transactions and parties.")

    return recommendations[:5]  # Top 5 recommendations


class SignalEngine:
    """
    Orchestrates signal detectors and aggregates results.

    The engine:
    1. Runs all configured detectors against the analysis context
    2. Weights and aggregates scores
    3. Identifies top contributing factors
    4. Generates an explainable risk assessment
    """

    def __init__(self, detectors: list[BaseDetector] | None = None):
        """
        Initialize with optional custom detector list.

        If no detectors provided, uses default set.
        """
        self.detectors = detectors or self._default_detectors()

    def _default_detectors(self) -> list[BaseDetector]:
        """Create default detector ensemble."""
        return [
            BenfordDetector(weight=1.2),
            RoundNumberDetector(weight=1.0),
            SplitInvoiceDetector(weight=1.3),
            BidRiggingDetector(weight=1.4),
            KeywordDetector(weight=1.0),
            UrgencyDetector(weight=0.9),
            VelocityDetector(weight=0.8),
        ]

    def analyze(self, context: AnalysisContext) -> AggregatedRiskResult:
        """
        Run all detectors and aggregate results.

        Args:
            context: Analysis context with text, numbers, entities, etc.

        Returns:
            AggregatedRiskResult with unified risk assessment.
        """
        detector_results: list[SignalResult] = []

        # Run all detectors
        for detector in self.detectors:
            try:
                result = detector.detect(context)
                detector_results.append(result)
            except Exception as e:
                # Log error but continue with other detectors
                detector_results.append(SignalResult(
                    detector_name=detector.name,
                    score=0,
                    weight=detector.weight,
                    indicators={"error": str(e)},
                    explanation=f"Detector error: {e}",
                    confidence=0,
                ))

        # Calculate weighted aggregate score
        total_weighted_score = 0.0
        total_weight = 0.0
        avg_confidence = 0.0

        for result in detector_results:
            if result.score > 0:
                weighted_score = result.score * result.weight * result.confidence
                total_weighted_score += weighted_score
                total_weight += result.weight
                avg_confidence += result.confidence

        if total_weight > 0:
            # Normalize to 0-100 scale
            # Use sqrt to compress extreme values
            raw_score = total_weighted_score / total_weight
            risk_score = int(min(raw_score, 100))
            avg_confidence = avg_confidence / len([r for r in detector_results if r.score > 0])
        else:
            risk_score = 0
            avg_confidence = 0.5

        risk_level = classify_risk_level(risk_score)

        # Identify top contributing factors
        contributing_results = sorted(
            [r for r in detector_results if r.score > 0],
            key=lambda r: r.score * r.weight * r.confidence,
            reverse=True,
        )

        top_factors = [
            {
                "detector": r.detector_name,
                "score_contribution": round(r.score * r.weight, 1),
                "confidence": round(r.confidence, 2),
                "explanation": r.explanation,
                "key_indicators": {
                    k: v for k, v in list(r.indicators.items())[:3]
                } if r.indicators else {},
            }
            for r in contributing_results[:5]
        ]

        # Build unified signals dict
        signals = {
            "detectors_run": len(self.detectors),
            "detectors_triggered": len(contributing_results),
            "detector_breakdown": {
                r.detector_name: {
                    "score": r.score,
                    "weight": r.weight,
                    "confidence": r.confidence,
                    "indicators": r.indicators,
                }
                for r in detector_results
            },
        }

        # Build explanation
        if risk_score == 0:
            explanation = "No significant corruption or fraud indicators detected by automated analysis."
        else:
            factor_names = [f["detector"] for f in top_factors[:3]]
            explanation = (
                f"Risk score {risk_score}/100 ({risk_level}). "
                f"Top contributing factors: {', '.join(factor_names)}. "
            )
            if top_factors:
                explanation += top_factors[0]["explanation"]

        # Generate recommendations
        recommendations = generate_recommendations(top_factors, risk_level)

        return AggregatedRiskResult(
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=round(avg_confidence, 2),
            signals=signals,
            explanation=explanation,
            top_factors=top_factors,
            detector_results=detector_results,
            recommendations=recommendations,
        )

    @classmethod
    def from_text(cls, text: str) -> AggregatedRiskResult:
        """
        Convenience method to analyze plain text.

        Creates context from text and runs analysis.
        """
        context = AnalysisContext(text=text)
        engine = cls()
        return engine.analyze(context)
