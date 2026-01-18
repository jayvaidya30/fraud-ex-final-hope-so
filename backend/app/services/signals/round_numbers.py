"""
Round number bias detector.

Fraudulent invoices and estimates often contain suspiciously round
numbers (e.g., $50,000 exactly) rather than precise amounts that
would result from actual transactions.
"""

import re
from collections import Counter

from .base import AnalysisContext, BaseDetector, SignalResult


def extract_monetary_amounts(text: str) -> list[float]:
    """
    Extract monetary amounts from text.

    Handles formats like: $1,234.56, 1234.56, $1234, etc.
    """
    # Pattern for monetary amounts
    patterns = [
        r'\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',  # $1,234.56
        r'\$\s*(\d+(?:\.\d{2})?)',  # $1234.56
        r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:USD|dollars?)',  # 1,234.56 USD
        r'(?:USD|amount|total|sum|payment|invoice)[:\s]+\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
    ]

    amounts = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                clean = match.replace(",", "")
                amount = float(clean)
                if amount > 0:
                    amounts.append(amount)
            except ValueError:
                continue

    return amounts


def is_round_number(amount: float, threshold: float = 100) -> tuple[bool, str]:
    """
    Check if an amount is suspiciously round.

    Returns (is_round, roundness_type).
    """
    if amount < threshold:
        return False, ""

    # Check for exact thousands
    if amount >= 1000 and amount % 1000 == 0:
        return True, "exact_thousands"

    # Check for exact hundreds
    if amount >= 100 and amount % 100 == 0:
        return True, "exact_hundreds"

    # Check for .00 amounts (no cents) on larger amounts
    if amount >= 1000 and amount == int(amount):
        return True, "no_cents"

    # Check for round patterns like 9999, 5000, etc.
    str_amount = str(int(amount))
    if len(str_amount) >= 4:
        # All same digit (1111, 5555, etc.)
        if len(set(str_amount)) == 1:
            return True, "repeated_digit"

        # Ends in multiple zeros
        trailing_zeros = len(str_amount) - len(str_amount.rstrip("0"))
        if trailing_zeros >= 3:
            return True, "many_trailing_zeros"

    return False, ""


class RoundNumberDetector(BaseDetector):
    """
    Detects suspicious prevalence of round numbers.

    High concentration of round amounts (especially exact thousands
    or hundreds) can indicate estimates, fabricated invoices, or
    price manipulation.
    """

    name = "round_numbers"
    default_weight = 1.0
    description = "Round number bias analysis"

    def __init__(self, weight: float | None = None, min_amounts: int = 3):
        super().__init__(weight)
        self.min_amounts = min_amounts

    def detect(self, context: AnalysisContext) -> SignalResult:
        # Extract amounts from text
        amounts = extract_monetary_amounts(context.text)

        # Also include pre-extracted amounts
        amounts.extend(context.amounts)

        # Deduplicate while preserving count info
        amounts = [a for a in amounts if a >= 100]  # Focus on significant amounts

        if len(amounts) < self.min_amounts:
            return self._make_result(
                score=0,
                indicators={"amounts_found": len(amounts), "min_required": self.min_amounts},
                explanation=f"Insufficient monetary amounts for analysis ({len(amounts)} found).",
                confidence=0.3,
            )

        # Analyze roundness
        round_amounts = []
        roundness_types = Counter()

        for amount in amounts:
            is_round, rtype = is_round_number(amount)
            if is_round:
                round_amounts.append(amount)
                roundness_types[rtype] += 1

        round_ratio = len(round_amounts) / len(amounts)

        # Score based on round number prevalence
        score = 0.0
        confidence = 0.7

        if round_ratio > 0.8 and len(round_amounts) >= 5:
            score = 30.0
            confidence = 0.85
        elif round_ratio > 0.6 and len(round_amounts) >= 4:
            score = 20.0
            confidence = 0.75
        elif round_ratio > 0.4 and len(round_amounts) >= 3:
            score = 10.0
            confidence = 0.65

        # Extra suspicion for exact thousands
        exact_thousands = roundness_types.get("exact_thousands", 0)
        if exact_thousands >= 3:
            score += 10.0
            confidence = min(confidence + 0.1, 1.0)

        # Build explanation
        if score > 0:
            explanation = (
                f"High prevalence of round numbers: {len(round_amounts)}/{len(amounts)} amounts "
                f"({round_ratio:.0%}) are suspiciously round. "
                f"Types: {dict(roundness_types)}. "
                f"This pattern may indicate estimates, fabricated invoices, or price manipulation."
            )
        else:
            explanation = (
                f"Amount distribution appears normal: {len(round_amounts)}/{len(amounts)} "
                f"({round_ratio:.0%}) round amounts, within expected range."
            )

        return self._make_result(
            score=score,
            indicators={
                "total_amounts": len(amounts),
                "round_amounts": len(round_amounts),
                "round_ratio": round(round_ratio, 3),
                "roundness_types": dict(roundness_types),
                "sample_round_amounts": round_amounts[:10],
            },
            explanation=explanation,
            confidence=confidence,
        )
