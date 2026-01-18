"""Explainability module (plain-language output).

The safeguards layer will ensure outputs are labeled as risk indicators.
"""

def format_explanation(heuristic_data: dict, llm_insight: str) -> str:
    """
    Combines heuristic signals and LLM insights into a structured Markdown report.
    """
    
    # 1. Structure the Heuristic Data
    heuristic_summary = ""
    if heuristic_data:
        heuristic_summary += "### 📊 Statistical Indicators\n\n"
        for signal, value in heuristic_data.items():
            # Format nicely if possible
            if isinstance(value, float):
                formatted_value = f"{value:.2f}"
            else:
                formatted_value = str(value)
            
            # Simple mapping for better readability
            signal_name = signal.replace("_", " ").title()
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
