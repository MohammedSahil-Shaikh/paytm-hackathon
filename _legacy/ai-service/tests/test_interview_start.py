"""Tests for POST /ai/interview/start."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

MOCK_PAYLOAD = {
    "candidate": {
        "name": "Jordan Lee",
        "resume_text": (
            "Backend engineer experienced with Python, FastAPI, PostgreSQL, and Redis. "
            "Built merchant APIs and improved checkout latency."
        ),
        "skills": ["Python", "FastAPI", "PostgreSQL", "Redis"],
        "experience_years": 3,
        "education": "B.Tech Computer Science",
        "summary": "Built payment APIs and merchant tooling.",
    },
    "target_company": "Paytm",
    "target_role": "Backend Engineer",
    "job_requirements": ["Python", "APIs", "SQL", "System design", "Kafka"],
    "company_research": None,
    "interview_type": "mixed",
    "question_count": 5,
}


def test_interview_start_returns_five_role_relevant_questions() -> None:
    response = client.post("/ai/interview/start", json=MOCK_PAYLOAD)

    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["error"] is None

    data = body["data"]
    assert data["target_company"] == "Paytm"
    assert data["target_role"] == "Backend Engineer"
    assert data["question_count"] == 5
    assert data["research_source"] == "mock_research"
    assert data["company_research"]["source"] == "mock_research"
    assert data["interview_id"].startswith("int_")

    questions = data["questions"]
    assert len(questions) == 5

    categories = {item["category"] for item in questions}
    assert {
        "technical",
        "behavioral",
        "problem_solving",
        "role_company",
    }.issubset(categories)

    for question in questions:
        assert question["id"]
        assert len(question["text"]) >= 8
        assert question["topic"]
        assert question["difficulty"] in {"easy", "mid", "hard"}
        assert "Paytm" in question["text"] or "Backend Engineer" in question["text"]


def test_interview_start_uses_provided_company_research() -> None:
    payload = {
        **MOCK_PAYLOAD,
        "company_research": {
            "company_name": "Paytm",
            "overview": "Provided research overview",
            "products": ["Custom wallet"],
            "culture_signals": ["Customer trust"],
            "recent_focus": ["Fraud controls"],
            "source": "provided",
        },
    }

    response = client.post("/ai/interview/start", json=payload)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["research_source"] == "provided"
    assert data["company_research"]["overview"] == "Provided research overview"
    assert data["company_research"]["products"] == ["Custom wallet"]


def test_interview_start_validation_error_envelope() -> None:
    response = client.post(
        "/ai/interview/start",
        json={
            "candidate": {"name": ""},
            "target_company": "Paytm",
            "target_role": "Backend Engineer",
        },
    )

    assert response.status_code == 422
    body = response.json()
    assert body["success"] is False
    assert body["data"] is None
    assert body["error"]["code"] == "VALIDATION_ERROR"
