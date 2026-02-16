# Mini Resume Collector API

A REST API built with **FastAPI** that accepts candidate resume details, validates input, and stores data in memory. Supports resume upload (PDF/DOC/DOCX), listing with filters, get by ID, and delete.

---

## Python version used

- **Python 3.10** or higher (3.11, 3.12 recommended)

---

## Installation steps

1. **Clone the repository** (or use this folder):
   ```bash
   git clone https://github.com/YOUR_USERNAME/miniresume-your-full-name.git
   cd miniresume-your-full-name
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/macOS
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Steps to run the application

1. From the project root (where `main.py` is), run:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. Open in browser:
   - API docs (Swagger): **http://127.0.0.1:8000/docs**
   - Health check: **http://127.0.0.1:8000/health**

---

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/candidates` | Upload resume + metadata |
| GET | `/candidates` | List candidates (optional filters: `skill`, `experience`, `graduation_year`) |
| GET | `/candidates/{id}` | Get candidate by ID |
| DELETE | `/candidates/{id}` | Delete candidate |

---

## Example API request / response

### 1. Health check

**Request:**
```http
GET /health HTTP/1.1
Host: 127.0.0.1:8000
```

**Response (200 OK):**
```json
{
  "status": "ok"
}
```

---

### 2. Upload a candidate (resume + metadata)

**Request:** (multipart form-data; use Postman, curl, or Swagger UI at `/docs`)

```http
POST /candidates HTTP/1.1
Host: 127.0.0.1:8000
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="full_name"

Jane Doe
------WebKitFormBoundary
Content-Disposition: form-data; name="dob"

1995-06-15
------WebKitFormBoundary
Content-Disposition: form-data; name="contact_number"

+1-555-123-4567
------WebKitFormBoundary
Content-Disposition: form-data; name="contact_address"

123 Main St, Chennai
------WebKitFormBoundary
Content-Disposition: form-data; name="education_qualification"

B.Tech Computer Science
------WebKitFormBoundary
Content-Disposition: form-data; name="graduation_year"

2017
------WebKitFormBoundary
Content-Disposition: form-data; name="years_of_experience"

5.5
------WebKitFormBoundary
Content-Disposition: form-data; name="skill_set"

Python, FastAPI, SQL
------WebKitFormBoundary
Content-Disposition: form-data; name="resume"; filename="jane_resume.pdf"
Content-Type: application/pdf

(binary PDF content)
------WebKitFormBoundary--
```

**Example with curl:**
```bash
curl -X POST "http://127.0.0.1:8000/candidates" \
  -F "full_name=Jane Doe" \
  -F "dob=1995-06-15" \
  -F "contact_number=+1-555-123-4567" \
  -F "contact_address=123 Main St, Chennai" \
  -F "education_qualification=B.Tech Computer Science" \
  -F "graduation_year=2017" \
  -F "years_of_experience=5.5" \
  -F "skill_set=Python, FastAPI, SQL" \
  -F "resume=@/path/to/jane_resume.pdf"
```

**Response (200 OK):**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "full_name": "Jane Doe",
  "dob": "1995-06-15",
  "contact_number": "+1-555-123-4567",
  "contact_address": "123 Main St, Chennai",
  "education_qualification": "B.Tech Computer Science",
  "graduation_year": 2017,
  "years_of_experience": 5.5,
  "skill_set": ["Python", "FastAPI", "SQL"],
  "resume_filename": "jane_resume.pdf"
}
```

---

### 3. List candidates (with optional filters)

**Request:**
```http
GET /candidates?skill=Python&experience=3&graduation_year=2017 HTTP/1.1
Host: 127.0.0.1:8000
```

**Response (200 OK):**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "full_name": "Jane Doe",
    "dob": "1995-06-15",
    "contact_number": "+1-555-123-4567",
    "contact_address": "123 Main St, Chennai",
    "education_qualification": "B.Tech Computer Science",
    "graduation_year": 2017,
    "years_of_experience": 5.5,
    "skill_set": ["Python", "FastAPI", "SQL"],
    "resume_filename": "jane_resume.pdf"
  }
]
```

---

### 4. Get candidate by ID

**Request:**
```http
GET /candidates/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: 127.0.0.1:8000
```

**Response (200 OK):** Same JSON object as in the list above.

**Response (404 Not Found):**
```json
{
  "detail": "Candidate not found"
}
```

---

### 5. Delete candidate

**Request:**
```http
DELETE /candidates/a1b2c3d4-e5f6-7890-abcd-ef1234567890 HTTP/1.1
Host: 127.0.0.1:8000
```

**Response (200 OK):**
```json
{
  "message": "Candidate deleted successfully"
}
```

---

## Project structure

- `main.py` – FastAPI app (instance named `app`), all endpoints and in-memory storage
- `requirements.txt` – Python dependencies
- `README.md` – This file

Data is stored **in memory** only; no database is required. Restarting the server clears all candidates.
