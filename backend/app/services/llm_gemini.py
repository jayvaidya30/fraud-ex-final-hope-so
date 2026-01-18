from app.core.config import settings


def is_configured() -> bool:
    return bool(settings.gemini_api_key)


def analyze_document(text: str) -> str:
    """
    Analyzes the document text using Gemini to find corruption risks.
    Uses a streamlined prompt for faster response.
    """
    if not is_configured():
        return "LLM analysis skipped (API key not configured)."

    try:
        from google import genai
        from google.genai import errors
    except Exception:
        return "LLM analysis skipped (google-genai not installed)."

    client = genai.Client(api_key=settings.gemini_api_key)

    # Use shorter text sample for faster processing (3000 chars instead of 10000)
    text_sample = text[:3000]
    
    # Streamlined prompt for faster response
    prompt = f"""Analyze this procurement/financial document for fraud indicators. Be brief.

Key risks to check:
- Unusual prices or round numbers
- Vendor collusion signs
- Procedure bypassing
- Vague service descriptions

Document excerpt:
{text_sample}

Provide a 2-3 sentence summary of any concerns found, or state if document appears normal."""

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text
    except errors.APIError as e:
        return f"Error during LLM analysis: {e.message}"
    except Exception as e:
        return f"Error during LLM analysis: {str(e)}"
    finally:
        try:
            client.close()
        except Exception:
            pass

