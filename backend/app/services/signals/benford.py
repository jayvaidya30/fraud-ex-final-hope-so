"""
Benford's Law detector.

Benford's Law states that in many naturally occurring datasets,
the leading digit d (1-9) appears with probability:
    P(d) = log10(1 + 1/d)

Deviation from this distribution can indicate data manipulation.
"""

import math
import re
from collections import Counter
from collections.abc import Mapping

from .base import AnalysisContext, BaseDetector, SignalResult

# Expected Benford distribution for leading digits 1-9
BENFORD_EXPECTED = {
    1: 0.301,
    2: 0.176,
    3: 0.125,
    4: 0.097,
    5: 0.079,
    6: 0.067,
    7: 0.058,
    8: 0.051,
    9: 0.046,
}


def extract_leading_digits(text: str) -> list[int]:
    """
    Extract leading digits from numbers in text.

    Filters to numbers >= 10 (single digits don't follow Benford well).
    """
    # Match numbers (with optional commas, decimals)
    pattern = r'\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b'
    matches = re.findall(pattern, text.replace(",", ""))

    leading_digits = []
    for match in matches:
        # Remove decimal point for parsing
        clean = match.replace(".", "").lstrip("0")
        if clean and len(clean) >= 2:  # Only numbers >= 10
            try:
                first_digit = int(clean[0])
                if 1 <= first_digit <= 9:
                    leading_digits.append(first_digit)
            except ValueError:
                continue

    return leading_digits


def chi_squared_statistic(observed: Mapping[int, float], expected: Mapping[int, float], n: int) -> float:
    """Calculate chi-squared statistic for Benford deviation."""
    chi_sq = 0.0
    for digit in range(1, 10):
        obs = observed.get(digit, 0)
        exp = expected[digit] * n
        if exp > 0:
            chi_sq += ((obs - exp) ** 2) / exp
    return chi_sq


def mean_absolute_deviation(observed: Mapping[int, float], expected: Mapping[int, float]) -> float:
    """Calculate mean absolute deviation from Benford distribution."""
    total_dev = 0.0
    for digit in range(1, 10):
        obs_pct = observed.get(digit, 0)
        exp_pct = expected[digit]
        total_dev += abs(obs_pct - exp_pct)
    return total_dev / 9


class BenfordDetector(BaseDetector):
    """
    Detects anomalies using Benford's Law analysis.

    Calculates deviation of leading digit distribution from expected
    Benford distribution. High deviation suggests potential data
    manipulation or fabrication.
    """

    name = "benford"
    default_weight = 1.2
    description = "Benford's Law leading digit analysis"

    def __init__(self, weight: float | None = None, min_numbers: int = 20):
        super().__init__(weight)
        self.min_numbers = min_numbers

    def detect(self, context: AnalysisContext) -> SignalResult:
        # Extract leading digits from text
        leading_digits = extract_leading_digits(context.text)

        # Also include any pre-extracted amounts
        for amount in context.amounts:
            if amount >= 10:
                first_digit = int(str(int(amount))[0])
                if 1 <= first_digit <= 9:
                    leading_digits.append(first_digit)

        n = len(leading_digits)

        # Need minimum sample size for statistical validity
        if n < self.min_numbers:
            return self._make_result(
                score=0,
                indicators={"sample_size": n, "min_required": self.min_numbers},
                explanation=f"Insufficient numbers for Benford analysis ({n} found, need {self.min_numbers}).",
                confidence=0.3,
            )

        # Calculate observed distribution
        counts = Counter(leading_digits)
        observed_pct = {d: counts.get(d, 0) / n for d in range(1, 10)}
        observed_counts = {d: float(counts.get(d, 0)) for d in range(1, 10)}

        # Calculate deviation metrics
        mad = mean_absolute_deviation(observed_pct, BENFORD_EXPECTED)
        chi_sq = chi_squared_statistic(observed_counts, BENFORD_EXPECTED, n)

        # Chi-squared critical value at p=0.05 with df=8 is ~15.51
        # At p=0.01 it's ~20.09
        chi_sq_critical_05 = 15.51
        chi_sq_critical_01 = 20.09

        # Score based on deviation severity
        # MAD > 0.015 is considered suspicious, > 0.03 is very suspicious
        score = 0.0
        confidence = 0.7

        if mad > 0.03 or chi_sq > chi_sq_critical_01:
            score = 35.0
            confidence = 0.85
        elif mad > 0.02 or chi_sq > chi_sq_critical_05:
            score = 20.0
            confidence = 0.75
        elif mad > 0.015:
            score = 10.0
            confidence = 0.6

        # Build explanation
        if score > 0:
            explanation = (
                f"Benford's Law deviation detected: MAD={mad:.4f}, χ²={chi_sq:.2f}. "
                f"The distribution of leading digits deviates significantly from expected patterns, "
                f"which may indicate fabricated or manipulated numbers."
            )
        else:
            explanation = (
                f"Leading digit distribution follows Benford's Law (MAD={mad:.4f}, χ²={chi_sq:.2f}). "
                f"No anomaly detected."
            )

        # Identify most deviant digits
        deviations = {
            d: observed_pct[d] - BENFORD_EXPECTED[d]
            for d in range(1, 10)
        }
        top_deviants = sorted(deviations.items(), key=lambda x: abs(x[1]), reverse=True)[:3]

        return self._make_result(
            score=score,
            indicators={
                "sample_size": n,
                "mean_absolute_deviation": round(mad, 5),
                "chi_squared": round(chi_sq, 3),
                "observed_distribution": {str(k): round(v, 4) for k, v in observed_pct.items()},
                "expected_distribution": {str(k): round(v, 4) for k, v in BENFORD_EXPECTED.items()},
                "top_deviations": [
                    {"digit": d, "deviation": round(dev, 4)} for d, dev in top_deviants
                ],
            },
            explanation=explanation,
            confidence=confidence,
        )
