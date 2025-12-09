from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import os
import traceback

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

router = APIRouter()

MODEL = "gemini-2.0-flash"   


@router.post("/ai-assist")
async def ai_assist(
    title: str = Form(""),
    price: Optional[float] = Form(None),
    category: str = Form(""),
    condition: str = Form(""),
    deliveryOption: str = Form(""),
    location: str = Form(""),
    currentDescription: str = Form(""),  
    images: Optional[List[UploadFile]] = File(None),
):
    images = images or []
    num_photos = len(images)


    # Build a compact context block for the model; omit empty fields.
    details = [
        f"Item title: {title}" if title else "",
        f"Item category: {category}" if category else "",
        f"Condition: {condition}" if condition else "",
        f"Price: ${price:.2f}" if price is not None else "",
        f"Delivery option: {deliveryOption}" if deliveryOption else "",
        f"Meetup location: {location}" if location else "",
        f"Number of photos attached: {num_photos}" if num_photos > 0 else "",
    ]
    details_text = "\n".join(d for d in details if d.strip())

    if not details_text:
        raise HTTPException(
            status_code=400,
            detail="Provide at least a title or some basic info for AI Assist.",
        )

    prompt = f"""
You help UMass students write marketplace listings.

You are writing ONLY the continuation of a sentence that starts with:
"{title} "

Important rules (you MUST follow these):
- Do NOT mention the item name, category, or any other product name.
- Your text will be appended directly after "{title} ".
- Start your text with the word "is".
- Do NOT introduce a different item (no 'desk lamp', 'calculator', etc.).
- Do NOT use brand or model names that are not given.
- 1–3 sentences total, max ~50 words.
- Plain text only, no headings, no bullet points, no markdown.

Use these structured fields as context:
{details_text}

Write ONLY the continuation starting with "is ...", nothing else.
"""

    try:
        # Use a constrained prompt to keep the model on-topic and under word limits.
        model = genai.GenerativeModel(MODEL)
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.25,   
                "max_output_tokens": 200,
            },
        )
        summary = (response.text or "").strip()
        if not summary:
            raise RuntimeError("Empty response from Gemini")

        return JSONResponse({"summary": summary})

    except Exception as e:
        print("Gemini error:")
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Gemini error: {str(e)}",
        )
