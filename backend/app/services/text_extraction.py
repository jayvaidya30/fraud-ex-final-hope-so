import csv
import io
from pathlib import Path


def extract_text(file_path: str | Path) -> str:
    """
    Extracts text from the given file (PDF, Image, CSV, or text).
    
    For CSV files, converts to a more analyzable format with monetary
    amounts explicitly marked for fraud detectors.
    """
    path = Path(file_path)
    if not path.exists():
        return ""

    suffix = path.suffix.lower()
    text = ""

    if suffix == ".pdf":
        text = _extract_from_pdf(path)
    elif suffix in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        text = _extract_from_image(path)
    elif suffix == ".csv":
        text = _extract_from_csv(path)
    elif suffix in [".xlsx", ".xls"]:
        text = _extract_from_excel(path)
    else:
        # Fallback for txt and other text files
        try:
            return path.read_text(errors="ignore")
        except Exception:
            return ""

    return text.strip()


def _extract_from_csv(csv_path: Path) -> str:
    """
    Extract and format CSV data for fraud analysis.
    
    Identifies amount columns and formats them with currency markers
    so fraud detectors can find and analyze them.
    """
    try:
        content = csv_path.read_text(errors="ignore")
        reader = csv.DictReader(io.StringIO(content))
        
        # Identify potential amount columns by name
        amount_keywords = [
            'amount', 'value', 'price', 'cost', 'total', 'sum', 
            'payment', 'invoice', 'bid', 'award', 'budget', 'fee',
            'contract', 'tender', 'estimate', 'quoted', 'paid'
        ]
        
        # Also identify date columns
        date_keywords = ['date', 'time', 'created', 'submitted', 'due']
        
        rows = list(reader)
        if not rows:
            return content
        
        fieldnames = list(rows[0].keys()) if rows else []
        amount_cols = []
        date_cols = []
        
        for col in fieldnames:
            col_lower = col.lower()
            if any(kw in col_lower for kw in amount_keywords):
                amount_cols.append(col)
            if any(kw in col_lower for kw in date_keywords):
                date_cols.append(col)
        
        # Build analyzable text with clear monetary markers
        lines = []
        lines.append(f"=== CSV Data Analysis ===")
        lines.append(f"Total records: {len(rows)}")
        lines.append(f"Columns: {', '.join(fieldnames)}")
        lines.append(f"Identified amount columns: {', '.join(amount_cols) if amount_cols else 'None detected'}")
        lines.append("")
        
        # Extract and format amounts with $ markers
        all_amounts = []
        for row in rows:
            for col in amount_cols:
                try:
                    val = row.get(col, "").replace(",", "").replace("$", "").strip()
                    if val:
                        amount = float(val)
                        if amount > 0:
                            all_amounts.append(amount)
                            lines.append(f"Amount: ${amount:,.2f} USD (column: {col})")
                except (ValueError, TypeError):
                    continue
        
        lines.append("")
        lines.append(f"=== Amount Summary ===")
        lines.append(f"Total amounts extracted: {len(all_amounts)}")
        if all_amounts:
            lines.append(f"Total sum: ${sum(all_amounts):,.2f}")
            lines.append(f"Average: ${sum(all_amounts)/len(all_amounts):,.2f}")
            lines.append(f"Min: ${min(all_amounts):,.2f}")
            lines.append(f"Max: ${max(all_amounts):,.2f}")
        
        # Add raw CSV content for context (vendors, descriptions, etc.)
        lines.append("")
        lines.append("=== Full Data ===")
        lines.append(content[:10000])  # First 10K chars of raw CSV
        
        return "\n".join(lines)
        
    except Exception as e:
        print(f"Error parsing CSV: {e}")
        # Fallback to raw text
        try:
            return csv_path.read_text(errors="ignore")
        except Exception:
            return ""


def _extract_from_excel(excel_path: Path) -> str:
    """Extract text from Excel files."""
    try:
        import pandas as pd
        
        # Read all sheets
        dfs = pd.read_excel(excel_path, sheet_name=None)
        
        lines = []
        for sheet_name, df in dfs.items():
            lines.append(f"=== Sheet: {sheet_name} ===")
            lines.append(f"Rows: {len(df)}, Columns: {len(df.columns)}")
            
            # Convert to CSV format and use CSV extractor
            csv_content = df.to_csv(index=False)
            temp_path = excel_path.parent / f"_temp_{sheet_name}.csv"
            temp_path.write_text(csv_content)
            sheet_text = _extract_from_csv(temp_path)
            temp_path.unlink()  # Clean up temp file
            lines.append(sheet_text)
            lines.append("")
        
        return "\n".join(lines)
        
    except ImportError:
        print("pandas not installed for Excel support")
        return ""
    except Exception as e:
        print(f"Error extracting Excel text: {e}")
        return ""


def _extract_from_pdf(pdf_path: Path) -> str:
    text_content = []
    try:
        import pymupdf  # fitz
        with pymupdf.open(pdf_path) as doc:
            for page in doc:
                text_content.append(page.get_text())
        
        # If text is empty, it might be a scanned PDF -> use OCR
        raw_text = "\n".join(text_content)
        if len(raw_text.strip()) < 50:
            # Try converting first page to image and OCR
            try:
                from pdf2image import convert_from_path
                import pytesseract
                
                # Convert only the first few pages to avoid massive processing time
                images = convert_from_path(str(pdf_path), first_page=1, last_page=3)
                ocr_text = ""
                for img in images:
                    ocr_text += pytesseract.image_to_string(img)
                
                if len(ocr_text.strip()) > len(raw_text.strip()):
                    return ocr_text
            except ImportError:
                print("pdf2image or pytesseract not installed/configured.")
            except Exception as e:
                print(f"OCR fallback failed: {e}")
            
        return raw_text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return ""


def _extract_from_image(img_path: Path) -> str:
    try:
        import pytesseract
        from PIL import Image
        return pytesseract.image_to_string(Image.open(img_path))
    except Exception as e:
        print(f"Error extracting image text: {e}")
        return ""
