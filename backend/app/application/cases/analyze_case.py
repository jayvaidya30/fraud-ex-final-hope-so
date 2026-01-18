from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from app.domain.case import CaseRecord, CaseUpdate
from app.domain.errors import CaseExtractionFailed, CaseMissingFile, CaseNotFound
from app.repositories.case_repo import CaseRepository
from app.services import explainability, llm_gemini, moderation, risk_scoring, text_extraction


@dataclass(frozen=True)
class AnalyzeCase:
    repository: CaseRepository

    async def execute(self, case_id: str) -> CaseRecord:
        case = await self.repository.get(case_id)
        if not case:
            raise CaseNotFound("Case not found")

        signals = case.get("signals") or {}
        file_path = signals.get("original_file")
        if not file_path:
            raise CaseMissingFile("No file associated with this case")

        text = text_extraction.extract_text(file_path)
        if not text:
            raise CaseExtractionFailed("Could not extract text")

        score, computed_signals, _ = risk_scoring.compute_risk_score(text)

        llm_analysis = llm_gemini.analyze_document(text)
        if llm_analysis and not moderation.check_content_safety(llm_analysis):
            llm_analysis = "⚠️ Analysis hidden due to safety policy."

        final_explanation = moderation.sanitize_output(
            explainability.format_explanation(computed_signals, llm_analysis)
        )

        merged_signals = {**signals, **computed_signals}
        merged_signals["extracted_text_preview"] = text[:500]
        merged_signals["analysis_completed_at"] = datetime.now(timezone.utc).isoformat()

        update_data: CaseUpdate = {
            "status": "analyzed",
            "risk_score": int(score),
            "signals": merged_signals,
            "explanation": final_explanation,
        }

        return await self.repository.update(case_id, update_data)
