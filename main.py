"""
Mini Resume Collector Application - FastAPI
Accepts candidate resume details via API, validates input, stores in memory.
"""

import base64
import uuid
from datetime import date
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field, field_validator

# ---------------------------------------------------------------------------
# FastAPI instance (must be named 'app' per assignment)
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Mini Resume Collector API",
    description="REST API for uploading resumes and managing candidate metadata.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# In-memory storage (no database)
# ---------------------------------------------------------------------------
candidates_store: dict[str, dict] = {}

# Allowed resume file types
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/msword",  # .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",  # .docx
}


# ---------------------------------------------------------------------------
# Request/Response models with validation
# ---------------------------------------------------------------------------
class CandidateCreate(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    dob: date
    contact_number: str = Field(..., min_length=1, max_length=20)
    contact_address: str = Field(..., min_length=1, max_length=500)
    education_qualification: str = Field(..., min_length=1, max_length=200)
    graduation_year: int = Field(..., ge=1950, le=2030)
    years_of_experience: float = Field(..., ge=0, le=70)
    skill_set: list[str] = Field(..., min_length=1)

    @field_validator("contact_number")
    @classmethod
    def contact_number_digits(cls, v: str) -> str:
        digits = "".join(c for c in v if c.isdigit() or c in "+- ")
        if len(digits.strip()) < 5:
            raise ValueError("Contact number must have at least 5 digits")
        return v


class CandidateResponse(BaseModel):
    id: str
    full_name: str
    dob: date
    contact_number: str
    contact_address: str
    education_qualification: str
    graduation_year: int
    years_of_experience: float
    skill_set: list[str]
    resume_filename: Optional[str] = None


# ---------------------------------------------------------------------------
# Health check (GET /health - REST standards)
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    """Health check endpoint. Returns 200 OK when service is up."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Resume upload - capture metadata + file
# ---------------------------------------------------------------------------
def _parse_date(dob_str: str) -> date:
    s = dob_str.strip()
    # Try ISO first (YYYY-MM-DD)
    try:
        return date.fromisoformat(s)
    except (ValueError, TypeError):
        pass
    # Try DD-MM-YYYY (e.g. 16-04-2003)
    parts = s.replace("/", "-").split("-")
    if len(parts) == 3:
        try:
            y, m, d = int(parts[2]), int(parts[1]), int(parts[0])
            if 1 <= m <= 12 and 1 <= d <= 31 and 1900 <= y <= 2100:
                return date(y, m, d)
        except (ValueError, TypeError):
            pass
    raise HTTPException(
        status_code=400,
        detail="Invalid date of birth. Use YYYY-MM-DD (e.g. 2003-04-16) or DD-MM-YYYY (e.g. 16-04-2003).",
    )


@app.post("/candidates", response_model=CandidateResponse)
async def create_candidate(
    full_name: str = Form(...),
    dob: str = Form(..., description="Date of birth: YYYY-MM-DD or DD-MM-YYYY"),
    contact_number: str = Form(...),
    contact_address: str = Form(...),
    education_qualification: str = Form(...),
    graduation_year: int = Form(..., ge=1950, le=2030),
    years_of_experience: float = Form(..., ge=0, le=70),
    skill_set: str = Form(...),  # comma-separated or JSON array string
    resume: UploadFile = File(...),
):
    """
    Upload a candidate resume (PDF/DOC/DOCX) with metadata.
    skill_set: comma-separated list, e.g. "Python, FastAPI, SQL"
    """
    # Validate and parse skill_set
    raw = skill_set.strip()
    if raw.startswith("["):
        import json
        try:
            skills = json.loads(raw)
            if not isinstance(skills, list) or not all(isinstance(s, str) for s in skills):
                raise ValueError("skill_set must be a list of strings")
        except json.JSONDecodeError:
            skills = [s.strip() for s in raw.replace("[", "").replace("]", "").split(",") if s.strip()]
    else:
        skills = [s.strip() for s in raw.split(",") if s.strip()]
    if not skills:
        raise HTTPException(status_code=400, detail="skill_set must have at least one skill")

    dob_parsed = _parse_date(dob)
    # Build validated payload
    payload = CandidateCreate(
        full_name=full_name,
        dob=dob_parsed,
        contact_number=contact_number,
        contact_address=contact_address,
        education_qualification=education_qualification,
        graduation_year=graduation_year,
        years_of_experience=years_of_experience,
        skill_set=skills,
    )

    # Validate file type
    ext = "." + (resume.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Resume must be PDF, DOC or DOCX. Got: {resume.filename}",
        )
    content_type = resume.content_type or ""
    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Resume content type not allowed: {content_type}",
        )

    file_bytes = await resume.read()
    candidate_id = str(uuid.uuid4())
    resume_filename = resume.filename

    # Store in memory
    candidates_store[candidate_id] = {
        "id": candidate_id,
        "full_name": payload.full_name,
        "dob": payload.dob,
        "contact_number": payload.contact_number,
        "contact_address": payload.contact_address,
        "education_qualification": payload.education_qualification,
        "graduation_year": payload.graduation_year,
        "years_of_experience": payload.years_of_experience,
        "skill_set": payload.skill_set,
        "resume_filename": resume_filename,
        "resume_content_base64": base64.b64encode(file_bytes).decode("utf-8"),
        "resume_content_type": content_type,
    }

    return CandidateResponse(
        id=candidate_id,
        full_name=payload.full_name,
        dob=payload.dob,
        contact_number=payload.contact_number,
        contact_address=payload.contact_address,
        education_qualification=payload.education_qualification,
        graduation_year=payload.graduation_year,
        years_of_experience=payload.years_of_experience,
        skill_set=payload.skill_set,
        resume_filename=resume_filename,
    )


# ---------------------------------------------------------------------------
# List candidates with filters (skill, experience, graduation_year)
# ---------------------------------------------------------------------------
@app.get("/candidates", response_model=list[CandidateResponse])
def list_candidates(
    skill: Optional[str] = Query(None, description="Filter by skill"),
    experience: Optional[float] = Query(None, ge=0, description="Filter by years of experience (min)"),
    graduation_year: Optional[int] = Query(None, ge=1950, le=2030, description="Filter by graduation year"),
):
    """List all candidates, optionally filtered by skill, experience, or graduation year."""
    result = list(candidates_store.values())
    if skill:
        skill_lower = skill.strip().lower()
        result = [c for c in result if any(skill_lower in s.lower() for s in c["skill_set"])]
    if experience is not None:
        result = [c for c in result if c["years_of_experience"] >= experience]
    if graduation_year is not None:
        result = [c for c in result if c["graduation_year"] == graduation_year]
    return [
        CandidateResponse(
            id=c["id"],
            full_name=c["full_name"],
            dob=c["dob"],
            contact_number=c["contact_number"],
            contact_address=c["contact_address"],
            education_qualification=c["education_qualification"],
            graduation_year=c["graduation_year"],
            years_of_experience=c["years_of_experience"],
            skill_set=c["skill_set"],
            resume_filename=c.get("resume_filename"),
        )
        for c in result
    ]


# ---------------------------------------------------------------------------
# Get candidate by ID
# ---------------------------------------------------------------------------
@app.get(
    "/candidates/{candidate_id}",
    response_model=CandidateResponse,
    responses={404: {"description": "Candidate not found"}},
)
def get_candidate(candidate_id: str):
    """Get a single candidate by ID."""
    if candidate_id not in candidates_store:
        raise HTTPException(status_code=404, detail="Candidate not found")
    c = candidates_store[candidate_id]
    return CandidateResponse(
        id=c["id"],
        full_name=c["full_name"],
        dob=c["dob"],
        contact_number=c["contact_number"],
        contact_address=c["contact_address"],
        education_qualification=c["education_qualification"],
        graduation_year=c["graduation_year"],
        years_of_experience=c["years_of_experience"],
        skill_set=c["skill_set"],
        resume_filename=c.get("resume_filename"),
    )


# ---------------------------------------------------------------------------
# Delete candidate
# ---------------------------------------------------------------------------
@app.delete(
    "/candidates/{candidate_id}",
    responses={404: {"description": "Candidate not found"}},
)
def delete_candidate(candidate_id: str):
    """Delete a candidate by ID."""
    if candidate_id not in candidates_store:
        raise HTTPException(status_code=404, detail="Candidate not found")
    del candidates_store[candidate_id]
    return {"message": "Candidate deleted successfully"}
