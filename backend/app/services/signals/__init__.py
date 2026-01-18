"""
Signal engine: composable detectors for corruption/fraud patterns.

Each detector returns a SignalResult with a score contribution,
detected indicators, and an explanation fragment. The engine
orchestrates all detectors and aggregates results.
"""

from .base import SignalResult, BaseDetector
from .engine import SignalEngine
from .benford import BenfordDetector
from .round_numbers import RoundNumberDetector
from .split_invoice import SplitInvoiceDetector
from .bid_rigging import BidRiggingDetector
from .keywords import KeywordDetector
from .urgency import UrgencyDetector
from .velocity import VelocityDetector

__all__ = [
    "SignalResult",
    "BaseDetector",
    "SignalEngine",
    "BenfordDetector",
    "RoundNumberDetector",
    "SplitInvoiceDetector",
    "BidRiggingDetector",
    "KeywordDetector",
    "UrgencyDetector",
    "VelocityDetector",
]
