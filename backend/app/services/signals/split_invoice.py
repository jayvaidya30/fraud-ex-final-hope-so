"""
Split invoice detector.

Detects patterns where invoices appear to be artificially split
to avoid approval thresholds. Common corruption tactic to bypass
controls requiring higher-level authorization.
"""

import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any

from .base import AnalysisContext, BaseDetector, SignalResult


@dataclass
class InvoiceCandidate:
    """Represents a potential invoice extracted from text."""

    amount: float
    date: str | None = None
    vendor: str | None = None
    invoice_number: str | None = None
    raw_text: str = ""


def extract_invoice_candidates(text: str) -> list[InvoiceCandidate]:
    """
    Extract potential invoice information from text.

    Looks for invoice numbers, amounts, dates, and vendor references.
    """
    candidates = []

    # Pattern for invoice lines
    # Matches patterns like: "Invoice #12345 - $1,234.56" or "INV-001: 1500.00"
    invoice_patterns = [
        r'(?:invoice|inv|bill)[#:\s-]*(\d+)[^\d]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'(?:invoice|inv|bill)[^\$]*\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)[^\d]*(?:invoice|inv|bill)',
    ]

    for pattern in invoice_patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            groups = match.groups()
            amount_str = groups[-1] if groups else None
            if amount_str:
                try:
                    amount = float(amount_str.replace(",", ""))
                    candidates.append(InvoiceCandidate(
                        amount=amount,
                        raw_text=match.group(0),
                    ))
                except ValueError:
                    continue

    # Also extract standalone amounts if they look like invoice amounts
    amount_pattern = r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)'
    for match in re.finditer(amount_pattern, text):
        try:
            amount = float(match.group(1).replace(",", ""))
            if 100 <= amount <= 1000000:  # Reasonable invoice range
                candidates.append(InvoiceCandidate(
                    amount=amount,
                    raw_text=match.group(0),
                ))
        except ValueError:
            continue

    return candidates


def detect_split_pattern(amounts: list[float], thresholds: list[float]) -> dict[str, Any]:
    """
    Detect if amounts cluster just below approval thresholds.

    Common thresholds: $5000, $10000, $25000, $50000, $100000
    """
    results = {
        "clusters_below_threshold": [],
        "suspicious_splits": [],
        "total_suspicious": 0,
    }

    for threshold in thresholds:
        # Look for amounts in the 80-99% range of threshold
        lower_bound = threshold * 0.80
        upper_bound = threshold * 0.99

        cluster = [a for a in amounts if lower_bound <= a < upper_bound]

        if len(cluster) >= 2:
            results["clusters_below_threshold"].append({
                "threshold": threshold,
                "amounts_below": cluster,
                "count": len(cluster),
                "total_if_combined": sum(cluster),
            })

            # Check if combining would exceed threshold
            if sum(cluster) > threshold:
                results["suspicious_splits"].append({
                    "threshold": threshold,
                    "split_amounts": cluster,
                    "combined_total": sum(cluster),
                    "exceeds_by": sum(cluster) - threshold,
                })
                results["total_suspicious"] += len(cluster)

    return results


class SplitInvoiceDetector(BaseDetector):
    """
    Detects patterns indicating invoice splitting.

    Looks for multiple amounts clustered just below common approval
    thresholds, suggesting intentional splitting to avoid controls.
    """

    name = "split_invoice"
    default_weight = 1.3
    description = "Invoice splitting pattern detection"

    def __init__(
        self,
        weight: float | None = None,
        thresholds: list[float] | None = None,
    ):
        super().__init__(weight)
        self.thresholds = thresholds or [
            5000.0,
            10000.0,
            25000.0,
            50000.0,
            100000.0,
        ]

    def detect(self, context: AnalysisContext) -> SignalResult:
        # Extract invoice candidates
        candidates = extract_invoice_candidates(context.text)
        amounts = [c.amount for c in candidates]

        # Add pre-extracted amounts
        amounts.extend(context.amounts)

        # Deduplicate
        amounts = list(set(amounts))

        if len(amounts) < 2:
            return self._make_result(
                score=0,
                indicators={"amounts_found": len(amounts)},
                explanation="Insufficient data for split invoice analysis.",
                confidence=0.3,
            )

        # Detect splitting patterns
        split_results = detect_split_pattern(amounts, self.thresholds)

        score = 0.0
        confidence = 0.6

        suspicious_count = split_results["total_suspicious"]
        split_count = len(split_results["suspicious_splits"])

        if split_count >= 3 or suspicious_count >= 6:
            score = 40.0
            confidence = 0.9
        elif split_count >= 2 or suspicious_count >= 4:
            score = 30.0
            confidence = 0.8
        elif split_count >= 1 or suspicious_count >= 2:
            score = 20.0
            confidence = 0.7

        # Build explanation
        if score > 0:
            split_details = []
            for split in split_results["suspicious_splits"][:3]:
                split_details.append(
                    f"${split['threshold']:,.0f} threshold: {len(split['split_amounts'])} invoices "
                    f"totaling ${split['combined_total']:,.2f}"
                )

            explanation = (
                f"Potential invoice splitting detected: {suspicious_count} amounts cluster "
                f"just below approval thresholds. "
                + "; ".join(split_details) + ". "
                "This pattern may indicate intentional splitting to circumvent approval controls."
            )
        else:
            explanation = "No invoice splitting patterns detected."

        return self._make_result(
            score=score,
            indicators={
                "amounts_analyzed": len(amounts),
                "thresholds_checked": self.thresholds,
                "clusters_below_threshold": split_results["clusters_below_threshold"],
                "suspicious_splits": split_results["suspicious_splits"],
                "total_suspicious_amounts": suspicious_count,
            },
            explanation=explanation,
            confidence=confidence,
        )
