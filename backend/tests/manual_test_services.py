import sys
import os

# Add the project root to the python path
sys.path.append("/home/siddharth/Projects/FraudEx/backend")

from app.services import moderation, explainability

def test_moderation():
    print("\n--- Testing Moderation Service ---")
    
    # Test safe content
    safe_text = "The vendor delivered the goods on time."
    is_safe = moderation.check_content_safety(safe_text)
    print(f"Safe text check: {'PASSED' if is_safe else 'FAILED'}")
    
    # Test unsafe content
    unsafe_text = "He is a purely corrupt person who stole money."
    is_safe = moderation.check_content_safety(unsafe_text)
    print(f"Unsafe text check: {'PASSED' if not is_safe else 'FAILED'}")

    # Test sanitization
    output = "Some analysis result."
    sanitized = moderation.sanitize_output(output)
    if "DISCLAIMER" in sanitized:
        print("Sanitization (Disclaimer check): PASSED")
    else:
        print("Sanitization (Disclaimer check): FAILED")


def test_explainability():
    print("\n--- Testing Explainability Service ---")
    
    heuristic_data = {"price_deviation": 15.5, "repeated_entities": 2}
    llm_insight = "This document shows slight anomalies in pricing."
    
    report = explainability.format_explanation(heuristic_data, llm_insight)
    
    print("Report Content:\n")
    print(report)
    
    if "Price Deviation" in report and "AI Analysis" in report:
        print("Report formatting: PASSED")
    else:
        print("Report formatting: FAILED")

if __name__ == "__main__":
    test_moderation()
    test_explainability()
