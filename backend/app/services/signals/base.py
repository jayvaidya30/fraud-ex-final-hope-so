"""
Base classes for signal detectors.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any


@dataclass
class SignalResult:
    """Result from a single detector."""

    detector_name: str
    score: float  # 0-100 contribution
    weight: float  # multiplier for final aggregation
    indicators: dict[str, Any] = field(default_factory=dict)
    explanation: str = ""
    confidence: float = 1.0  # 0-1, how confident are we in this signal


@dataclass
class AnalysisContext:
    """Context passed to detectors for analysis."""

    text: str
    numbers: list[float] = field(default_factory=list)
    amounts: list[float] = field(default_factory=list)
    dates: list[str] = field(default_factory=list)
    entities: list[dict[str, Any]] = field(default_factory=list)
    relationships: list[dict[str, Any]] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


class BaseDetector(ABC):
    """Abstract base class for signal detectors."""

    name: str = "base"
    default_weight: float = 1.0
    description: str = ""

    def __init__(self, weight: float | None = None):
        self.weight = weight if weight is not None else self.default_weight

    @abstractmethod
    def detect(self, context: AnalysisContext) -> SignalResult:
        """
        Analyze the context and return a SignalResult.

        Args:
            context: Analysis context with text, numbers, entities, etc.

        Returns:
            SignalResult with score, indicators, and explanation.
        """
        pass

    def _make_result(
        self,
        score: float,
        indicators: dict[str, Any] | None = None,
        explanation: str = "",
        confidence: float = 1.0,
    ) -> SignalResult:
        """Helper to create a SignalResult with this detector's metadata."""
        return SignalResult(
            detector_name=self.name,
            score=min(max(score, 0), 100),  # clamp to 0-100
            weight=self.weight,
            indicators=indicators or {},
            explanation=explanation,
            confidence=confidence,
        )
