from app.core.config import settings


def is_configured() -> bool:
    return bool(settings.gemini_api_key)


def analyze_document(text: str) -> str:
    """
    Analyzes the document text using Gemini to find corruption risks.
    """
    if not is_configured():
        return "LLM analysis skipped (API key not configured)."

    try:
        from google import genai
        from google.genai import errors
    except Exception:
        return "LLM analysis skipped (google-genai not installed)."

    client = genai.Client(api_key=settings.gemini_api_key)

    prompt = f"""
    You are an expert anti-corruption analyst. Analyze the following document text for indicators of fraud, corruption, or irregularity.
    
    Focus on:
    - Unusually high prices or round numbers.
    - Vendor collusion or conflict of interest clues.
    - Urgency or bypassing of procedure.
    - Vague descriptions of services.
    
    Provide a concise summary of risk indicators. If none found, state that the document appears standard.
    
    Document Text:
    {text[:10000]}  # Truncate to avoid context limit for MVP
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
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
