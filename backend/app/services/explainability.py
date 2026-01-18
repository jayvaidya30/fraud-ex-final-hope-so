"""Explainability module (plain-language output).

The safeguards layer will ensure outputs are labeled as risk indicators.
"""


def _format_value(key: str, value) -> str:
    """Format a value based on its type and key name."""
    if value is None:
        return "N/A"
    
    if isinstance(value, (int, float)):
        if isinstance(value, float):
            return f"{value:.2f}"
        return str(value)
    
    if isinstance(value, bool):
        return "Yes" if value else "No"
    
    if isinstance(value, str):
        return value
    
    if isinstance(value, list):
        return _format_list(key, value)
    
    if isinstance(value, dict):
        return _format_dict(key, value)
    
    return str(value)


def _format_list(key: str, items: list) -> str:
    """Format a list into markdown."""
    if not items:
        return "None"
    
    # Check if it's a list of simple items or complex objects
    if all(isinstance(item, (str, int, float, bool)) for item in items):
        return ", ".join(str(item) for item in items[:10])
    
    # Handle top_factors specifically
    if key == "top_factors":
        result_lines = []
        for i, factor in enumerate(items[:5], 1):
            if isinstance(factor, dict):
                detector = factor.get("detector", "Unknown")
                score = factor.get("score_contribution", factor.get("score", 0))
                explanation = factor.get("explanation", "")
                confidence = factor.get("confidence", 0)
                
                result_lines.append(f"\n**{i}. {detector.replace('_', ' ').title()}** (Score: {score}, Confidence: {confidence:.0%})")
                if explanation:
                    result_lines.append(f"   - {explanation}")
        return "\n".join(result_lines) if result_lines else "None"
    
    # Handle recommendations
    if key == "recommendations":
        return "\n".join(f"  - {item}" for item in items[:5])
    
    # Generic list of dicts
    if all(isinstance(item, dict) for item in items):
        result_lines = []
        for item in items[:5]:
            if "type" in item and "description" in item:
                result_lines.append(f"  - **{item['type']}**: {item['description']}")
            else:
                # Summarize the dict
                summary = ", ".join(f"{k}: {v}" for k, v in list(item.items())[:3])
                result_lines.append(f"  - {summary}")
        return "\n".join(result_lines) if result_lines else "None"
    
    return ", ".join(str(item) for item in items[:10])


def _format_dict(key: str, data: dict) -> str:
    """Format a dict into markdown."""
    if not data:
        return "None"
    
    # Handle detector_breakdown specially
    if key == "detector_breakdown":
        result_lines = []
        for detector_name, detector_data in sorted(data.items()):
            if isinstance(detector_data, dict):
                score = detector_data.get("score", 0)
                if score > 0:
                    result_lines.append(f"  - **{detector_name.replace('_', ' ').title()}**: Score {score}")
        return "\n".join(result_lines) if result_lines else "No detectors triggered"
    
    # Handle key_indicators
    if key == "key_indicators":
        return ", ".join(f"{k}: {v}" for k, v in list(data.items())[:5])
    
    # Generic dict formatting
    return ", ".join(f"{k}: {v}" for k, v in list(data.items())[:5])


def format_explanation(heuristic_data: dict, llm_insight: str) -> str:
    """
    Combines heuristic signals and LLM insights into a structured Markdown report.
    """
    
    # Priority signals to display at the top
    priority_signals = ["risk_level", "confidence", "top_factors", "recommendations"]
    
    # Signals to skip (internal or redundant)
    skip_signals = [
        "extracted_text_preview", "original_file", "analysis_completed_at",
        "detectors_triggered", "detectors_run"
    ]
    
    # 1. Structure the Heuristic Data
    heuristic_summary = ""
    if heuristic_data:
        heuristic_summary += "### 📊 Statistical Indicators\n\n"
        
        # First, show priority signals
        for signal in priority_signals:
            if signal in heuristic_data:
                value = heuristic_data[signal]
                signal_name = signal.replace("_", " ").title()
                formatted_value = _format_value(signal, value)
                heuristic_summary += f"- **{signal_name}**: {formatted_value}\n"
        
        # Then show other signals (excluding priority and skip)
        for signal, value in heuristic_data.items():
            if signal in priority_signals or signal in skip_signals:
                continue
            
            signal_name = signal.replace("_", " ").title()
            formatted_value = _format_value(signal, value)
            
            # Don't include very long formatted values inline
            if len(formatted_value) > 200 or "\n" in formatted_value:
                heuristic_summary += f"\n**{signal_name}:**\n{formatted_value}\n"
            else:
                heuristic_summary += f"- **{signal_name}**: {formatted_value}\n"
    
    # 2. Add LLM Insight
    llm_section = ""
    if llm_insight:
        llm_section = f"\n### 🤖 AI Analysis\n\n{llm_insight}\n"
        
    # 3. Combine
    report = f"""## Risk Analysis Report

{heuristic_summary}
{llm_section}
"""
    return report

