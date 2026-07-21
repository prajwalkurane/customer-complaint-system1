from pathlib import Path
from PIL import Image
import pytesseract
from PyPDF2 import PdfReader
def extract_text(path: Path, content_type: str) -> str:
    try:
        if content_type == "application/pdf": return "\n".join(page.extract_text() or "" for page in PdfReader(str(path)).pages)[:20000]
        if content_type.startswith("image/"): return pytesseract.image_to_string(Image.open(path))[:20000]
        if content_type.startswith("text/"): return path.read_text(errors="ignore")[:20000]
    except Exception: pass
    return ""
