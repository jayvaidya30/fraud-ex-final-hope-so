"""
Urgency signal detector.

Detects language indicating unusual urgency or pressure, which can
be a red flag for fraud attempts (e.g., "approve immediately",
"must process today").
"""

import re
from .base import AnalysisContext, BaseDetector, SignalResult


URGENCY_PATTERNS = [
    # Direct urgency
    (r'\b(urgent|urgently|asap|immediately|right away|right now)\b', 1.5),
    (r'\b(rush|rushed|expedite|expedited)\b', 1.3),
    (r'\b(critical|crucial|essential|vital)\s+(deadline|timeline|timing)', 1.4),

    # Time pressure
    (r'\b(today|tonight|this morning|this afternoon|within hours?)\b', 1.2),
    (r'\b(by\s+(?:end of|close of)\s+(?:day|business))\b', 1.3),
    (r'\b(deadline\s+(?:is\s+)?(?:today|tomorrow|approaching))\b', 1.4),

    # Approval pressure
    (r'\b(must\s+(?:be\s+)?approv(?:e|ed)|needs?\s+(?:immediate\s+)?approval)\b', 1.5),
    (r'\b(approve\s+(?:now|immediately|today|asap))\b', 1.6),
    (r'\b(skip\s+(?:the\s+)?review|bypass\s+(?:normal\s+)?process)\b', 1.8),

    # Consequence warnings
    (r'\b(or\s+else|otherwise|consequences?|penalty|penalized)\b', 1.4),
    (r'\b(lose\s+(?:the\s+)?(?:deal|contract|opportunity))\b', 1.5),
    (r'\b(miss(?:ed)?\s+(?:the\s+)?deadline)\b', 1.3),

    # Authority pressure
    (r'\b((?:ceo|cfo|president|director|boss)\s+(?:wants?|needs?|demands?))\b', 1.4),
    (r'\b(executive\s+(?:order|request|priority))\b', 1.3),
    (r'\b(do\s+not\s+(?:question|delay|wait))\b', 1.7),
]


class UrgencyDetector(BaseDetector):
    """
    Detects urgent or pressuring language.

    Unusual urgency can indicate social engineering attempts,
    fraud schemes that rely on bypassing normal review processes,
    or legitimate but risky rush decisions.
    """

    name = "urgency"
    default_weight = 0.9
    description = "Urgency and pressure language detection"

    def detect(self, context: AnalysisContext) -> SignalResult:
        text_lower = context.text.lower()
        matches = []
        total_weight = 0.0

        for pattern, weight in URGENCY_PATTERNS:
            for match in re.finditer(pattern, text_lower, re.IGNORECASE):
                matches.append({
                    "pattern": pattern,
                    "matched_text": match.group(0),
                    "weight": weight,
                    "position": match.start(),
                })
                total_weight += weight

        if not matches:
            return self._make_result(
                score=0,
                indicators={},
                explanation="No urgent or pressuring language detected.",
                confidence=0.7,
            )

        # Score based on weighted matches (cap at 25 for urgency alone)
        score = min(total_weight * 5, 25)

        # Higher confidence with more diverse patterns
        unique_patterns = len(set(m["pattern"] for m in matches))
        confidence = 0.5 + (unique_patterns * 0.1)
        confidence = min(confidence, 0.85)

        # Build explanation
        sample_phrases = list(set(m["matched_text"] for m in matches))[:5]

        explanation = (
            f"Detected {len(matches)} instances of urgent/pressuring language: "
            f'"{", ".join(sample_phrases)}". '
            "Unusual urgency may indicate an attempt to bypass normal review processes."
        )

        return self._make_result(
            score=score,
            indicators={
                "total_matches": len(matches),
                "unique_patterns": unique_patterns,
                "weighted_score": round(total_weight, 2),
                "sample_phrases": sample_phrases,
            },
            explanation=explanation,
            confidence=confidence,
        )
