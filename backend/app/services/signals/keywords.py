"""
Keyword-based corruption signal detector.

Detects suspicious keywords and phrases commonly associated with
corruption, bribery, and fraudulent activities.
"""

import re
from collections import Counter
from typing import Any

from .base import AnalysisContext, BaseDetector, SignalResult


# Keyword categories with weights
KEYWORD_CATEGORIES = {
    "bribery": {
        "keywords": [
            "bribe", "kickback", "payoff", "grease payment", "facilitation payment",
            "under the table", "cash payment", "gift", "gratuity", "inducement",
        ],
        "weight": 2.0,
    },
    "concealment": {
        "keywords": [
            "off-book", "undisclosed", "hidden", "secret", "confidential arrangement",
            "side agreement", "unofficial", "unrecorded", "destroy records",
        ],
        "weight": 1.8,
    },
    "pressure": {
        "keywords": [
            "must approve", "no questions", "bypass", "override", "expedite approval",
            "special handling", "exception", "waive requirement", "ignore policy",
        ],
        "weight": 1.5,
    },
    "shell_entities": {
        "keywords": [
            "shell company", "nominee", "offshore", "bearer shares", "trust account",
            "intermediary", "proxy", "front company", "special purpose vehicle",
        ],
        "weight": 1.7,
    },
    "conflicts": {
        "keywords": [
            "conflict of interest", "related party", "family member", "personal relationship",
            "undisclosed relationship", "competing interest", "self-dealing",
        ],
        "weight": 1.6,
    },
    "financial_irregularity": {
        "keywords": [
            "cash only", "no receipt", "no invoice", "falsified", "inflated",
            "duplicate payment", "phantom", "fictitious", "overbilling",
        ],
        "weight": 1.9,
    },
}


def find_keywords(text: str, keywords: list[str]) -> list[dict[str, Any]]:
    """Find keywords in text with context."""
    found = []
    text_lower = text.lower()

    for keyword in keywords:
        pattern = r'\b' + re.escape(keyword.lower()) + r'\b'
        for match in re.finditer(pattern, text_lower):
            # Extract surrounding context (50 chars each side)
            start = max(0, match.start() - 50)
            end = min(len(text), match.end() + 50)
            context = text[start:end].strip()

            found.append({
                "keyword": keyword,
                "position": match.start(),
                "context": context,
            })

    return found


class KeywordDetector(BaseDetector):
    """
    Detects suspicious keywords and phrases.

    Searches for terminology commonly associated with corruption,
    concealment, conflicts of interest, and financial irregularities.
    """

    name = "keywords"
    default_weight = 1.0
    description = "Suspicious keyword and phrase detection"

    def __init__(
        self,
        weight: float | None = None,
        custom_keywords: dict[str, list[str]] | None = None,
    ):
        super().__init__(weight)
        self.categories = KEYWORD_CATEGORIES.copy()
        if custom_keywords:
            for category, keywords in custom_keywords.items():
                if category in self.categories:
                    self.categories[category]["keywords"].extend(keywords)
                else:
                    self.categories[category] = {"keywords": keywords, "weight": 1.0}

    def detect(self, context: AnalysisContext) -> SignalResult:
        all_found: list[dict] = []
        category_scores: dict[str, float] = {}
        category_hits: dict[str, list[str]] = {}

        for category, config in self.categories.items():
            keywords = config["keywords"]
            cat_weight = config["weight"]

            matches = find_keywords(context.text, keywords)
            if matches:
                unique_keywords = list(set(m["keyword"] for m in matches))
                category_hits[category] = unique_keywords
                # Score: base 10 per unique keyword, weighted by category
                category_scores[category] = len(unique_keywords) * 10 * cat_weight
                all_found.extend(matches)

        if not all_found:
            return self._make_result(
                score=0,
                indicators={"categories_checked": list(self.categories.keys())},
                explanation="No suspicious keywords detected.",
                confidence=0.7,
            )

        # Calculate total score (capped at 50 for keywords alone)
        raw_score = sum(category_scores.values())
        score = min(raw_score, 50)

        # Confidence based on diversity of categories
        confidence = 0.6 + (len(category_hits) * 0.1)
        confidence = min(confidence, 0.95)

        # Build explanation
        category_summary = [
            f"{cat}: {', '.join(keywords[:3])}" + ("..." if len(keywords) > 3 else "")
            for cat, keywords in category_hits.items()
        ]

        explanation = (
            f"Found {len(all_found)} suspicious keyword occurrences across "
            f"{len(category_hits)} categories: " + "; ".join(category_summary) + "."
        )

        return self._make_result(
            score=score,
            indicators={
                "total_matches": len(all_found),
                "categories_triggered": list(category_hits.keys()),
                "category_details": {
                    cat: {
                        "keywords_found": keywords,
                        "score_contribution": category_scores[cat],
                    }
                    for cat, keywords in category_hits.items()
                },
                "sample_matches": all_found[:10],
            },
            explanation=explanation,
            confidence=confidence,
        )
