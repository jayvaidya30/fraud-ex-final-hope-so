"""
Bid rigging pattern detector.

Detects patterns that may indicate bid rigging or collusion:
- Identical or suspiciously similar bid amounts
- Round-number bids
- Sequential/patterned bid numbers
- Vendor relationships suggesting coordination
"""

import re
from collections import Counter
from itertools import combinations

from .base import AnalysisContext, BaseDetector, SignalResult


def extract_bids(text: str) -> list[dict]:
    """
    Extract bid information from text.

    Looks for patterns like:
    - "Bid: $X" or "Quote: $X"
    - "Vendor A: $X"
    - "Proposal amount: $X"
    """
    bids = []

    # Pattern for bid amounts with optional vendor
    patterns = [
        r'(?:bid|quote|proposal|offer)[#:\s]*(?:from\s+)?([A-Za-z\s&]+)?[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'([A-Za-z\s&]+)\s*(?:bid|quote|proposal)?[:\s]+\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
        r'vendor\s*[#:\s]*(\d+|[A-Za-z]+)[:\s]*\$?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
    ]

    for pattern in patterns:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            vendor = None
            if match.lastindex and match.lastindex >= 1:
                vendor = match.group(1).strip() if match.group(1) else None
            amount_str = None
            if match.lastindex and match.lastindex >= 2:
                amount_str = match.group(2)
            elif match.lastindex and match.lastindex >= 1:
                amount_str = match.group(1)
            if not amount_str:
                continue
            try:
                amount = float(amount_str.replace(",", ""))
                bids.append({
                    "vendor": vendor,
                    "amount": amount,
                    "raw": match.group(0),
                })
            except (ValueError, AttributeError):
                continue

    return bids


def detect_bid_patterns(bids: list[dict]) -> dict:
    """
    Analyze bids for suspicious patterns.
    """
    if len(bids) < 2:
        return {"patterns_found": [], "risk_indicators": []}

    amounts = [b["amount"] for b in bids]
    patterns_found = []
    risk_indicators = []

    # 1. Check for identical bids
    amount_counts = Counter(amounts)
    identical = [(amt, count) for amt, count in amount_counts.items() if count > 1]
    if identical:
        patterns_found.append("identical_bids")
        risk_indicators.append({
            "type": "identical_bids",
            "description": f"Found {len(identical)} identical bid amounts",
            "details": identical,
        })

    # 2. Check for suspiciously close bids (within 1%)
    sorted_amounts = sorted(set(amounts))
    close_pairs = []
    for a1, a2 in combinations(sorted_amounts, 2):
        if a1 > 0:
            diff_pct = abs(a2 - a1) / a1
            if diff_pct < 0.01:  # Within 1%
                close_pairs.append((a1, a2, diff_pct))

    if close_pairs:
        patterns_found.append("suspiciously_close_bids")
        risk_indicators.append({
            "type": "suspiciously_close_bids",
            "description": f"Found {len(close_pairs)} pairs of bids within 1% of each other",
            "details": close_pairs[:5],
        })

    # 3. Check for round number bids
    round_bids = [a for a in amounts if a >= 1000 and a % 1000 == 0]
    if len(round_bids) > len(amounts) * 0.5:
        patterns_found.append("excessive_round_bids")
        risk_indicators.append({
            "type": "excessive_round_bids",
            "description": f"{len(round_bids)}/{len(amounts)} bids are round thousands",
            "details": round_bids,
        })

    # 4. Check for complementary bids (one high, rest low by similar margin)
    if len(amounts) >= 3:
        sorted_amounts = sorted(amounts)
        highest = sorted_amounts[-1]
        others = sorted_amounts[:-1]

        # Check if losing bids are all within a narrow band
        if others:
            spread = (max(others) - min(others)) / highest if highest > 0 else 0
            if spread < 0.05 and len(others) >= 2:  # Losing bids clustered
                patterns_found.append("complementary_bids")
                risk_indicators.append({
                    "type": "complementary_bids",
                    "description": "Losing bids suspiciously clustered, suggesting rotation scheme",
                    "details": {
                        "winning_bid": highest,
                        "losing_bids": others,
                        "losing_spread_pct": spread,
                    },
                })

    # 5. Check for sequential/patterned amounts
    diffs = [sorted_amounts[i+1] - sorted_amounts[i] for i in range(len(sorted_amounts)-1)]
    if len(diffs) >= 2:
        diff_counts = Counter(diffs)
        most_common_diff, count = diff_counts.most_common(1)[0]
        if count >= 2 and most_common_diff > 0:
            patterns_found.append("sequential_bids")
            risk_indicators.append({
                "type": "sequential_bids",
                "description": f"Bids follow arithmetic pattern (diff={most_common_diff})",
                "details": {"common_difference": most_common_diff, "occurrences": count},
            })

    return {
        "patterns_found": patterns_found,
        "risk_indicators": risk_indicators,
        "bid_count": len(bids),
        "unique_amounts": len(set(amounts)),
    }


class BidRiggingDetector(BaseDetector):
    """
    Detects patterns indicating potential bid rigging or collusion.

    Analyzes bid data for:
    - Identical or near-identical amounts
    - Complementary bidding (rotation schemes)
    - Suspicious numerical patterns
    - Round number bias in competitive bids
    """

    name = "bid_rigging"
    default_weight = 1.4
    description = "Bid rigging and collusion pattern detection"

    def detect(self, context: AnalysisContext) -> SignalResult:
        # Extract bids from text
        bids = extract_bids(context.text)

        # Check for bid-related keywords
        text_lower = context.text.lower()
        has_bid_context = any(
            kw in text_lower
            for kw in ["bid", "quote", "proposal", "tender", "rfp", "rfq", "procurement"]
        )

        if not bids and not has_bid_context:
            return self._make_result(
                score=0,
                indicators={"bid_context": False},
                explanation="No bidding/procurement context detected.",
                confidence=0.5,
            )

        # If we have bid context but no structured bids, lower confidence
        if not bids:
            return self._make_result(
                score=0,
                indicators={"bid_context": True, "bids_extracted": 0},
                explanation="Bidding context found but no structured bid data extracted.",
                confidence=0.4,
            )

        # Analyze bid patterns
        analysis = detect_bid_patterns(bids)

        patterns = analysis["patterns_found"]
        indicators = analysis["risk_indicators"]

        score = 0.0
        confidence = 0.6

        # Score based on patterns found
        pattern_scores = {
            "identical_bids": 25,
            "complementary_bids": 30,
            "suspiciously_close_bids": 20,
            "sequential_bids": 15,
            "excessive_round_bids": 10,
        }

        for pattern in patterns:
            score += pattern_scores.get(pattern, 5)
            confidence = min(confidence + 0.1, 0.95)

        score = min(score, 100)

        # Build explanation
        if score > 0:
            pattern_descriptions = [ind["description"] for ind in indicators[:3]]
            explanation = (
                f"Potential bid rigging indicators: {', '.join(patterns)}. "
                + "; ".join(pattern_descriptions) + ". "
                "These patterns may indicate collusion or bid manipulation."
            )
        else:
            explanation = "No bid rigging patterns detected in the extracted bid data."

        return self._make_result(
            score=score,
            indicators={
                "bids_analyzed": len(bids),
                "patterns_detected": patterns,
                "risk_indicators": indicators,
                "bid_summary": {
                    "count": analysis["bid_count"],
                    "unique_amounts": analysis["unique_amounts"],
                },
            },
            explanation=explanation,
            confidence=confidence,
        )
