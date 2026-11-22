"""Schemas for interview-start and shared interview question contracts."""

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class QuestionCategory(str, Enum):
    """Required coverage categories for a generated interview set."""

    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    PROBLEM_SOLVING = "problem_solving"
    ROLE_COMPANY = "role_company"


class Difficulty(str, Enum):
    EASY = "easy"
    MID = "mid"
    HARD = "hard"


class CandidateProfileInput(BaseModel):
    """Candidate inputs used to personalize interview generation."""

    name: str = Field(..., min_length=1, max_length=200)
    resume_text: str = Field(default="", max_length=50_000)
    skills: list[str] = Field(default_factory=list)
    experience_years: float = Field(default=0, ge=0, le=60)
    education: str | None = Field(default=None, max_length=500)
    summary: str | None = Field(default=None, max_length=2000)

    @field_validator("skills")
    @classmethod
    def normalize_skills(cls, value: list[str]) -> list[str]:
        cleaned = [skill.strip() for skill in value if skill and skill.strip()]
        return cleaned[:40]


class CompanyResearchInput(BaseModel):
    """Optional company research payload. Mocked when omitted."""

    company_name: str = Field(..., min_length=1, max_length=200)
    overview: str = Field(default="", max_length=5000)
    products: list[str] = Field(default_factory=list)
    culture_signals: list[str] = Field(default_factory=list)
    recent_focus: list[str] = Field(default_factory=list)
    source: str = Field(default="provided", max_length=100)


class InterviewStartRequest(BaseModel):
    """Request body for POST /ai/interview/start."""

    candidate: CandidateProfileInput
    target_company: str = Field(..., min_length=1, max_length=200)
    target_role: str = Field(..., min_length=1, max_length=200)
    job_requirements: list[str] = Field(default_factory=list)
    company_research: CompanyResearchInput | None = None
    interview_type: str = Field(default="mixed", max_length=50)
    question_count: int = Field(default=5, ge=5, le=5)

    @field_validator("job_requirements")
    @classmethod
    def normalize_requirements(cls, value: list[str]) -> list[str]:
        cleaned = [item.strip() for item in value if item and item.strip()]
        return cleaned[:40]


class InterviewQuestion(BaseModel):
    """Single interview question in the agreed response format."""

    id: str = Field(..., min_length=1, max_length=64)
    text: str = Field(..., min_length=8, max_length=2000)
    topic: str = Field(..., min_length=1, max_length=120)
    difficulty: Difficulty
    category: QuestionCategory
    rationale: str = Field(
        default="",
        max_length=500,
        description="Why this question was selected for the candidate/role.",
    )


class InterviewStartData(BaseModel):
    """Successful interview-start payload."""

    interview_id: str
    target_company: str
    target_role: str
    question_count: int = 5
    research_source: str
    company_research: CompanyResearchInput
    questions: list[InterviewQuestion] = Field(..., min_length=5, max_length=5)

    @field_validator("questions")
    @classmethod
    def validate_coverage(cls, value: list[InterviewQuestion]) -> list[InterviewQuestion]:
        if len(value) != 5:
            raise ValueError("Exactly 5 questions are required.")
        categories = {question.category for question in value}
        required = {
            QuestionCategory.TECHNICAL,
            QuestionCategory.BEHAVIORAL,
            QuestionCategory.PROBLEM_SOLVING,
            QuestionCategory.ROLE_COMPANY,
        }
        missing = required - categories
        if missing:
            missing_labels = ", ".join(sorted(item.value for item in missing))
            raise ValueError(f"Missing required question categories: {missing_labels}")
        return value


class ErrorBody(BaseModel):
    code: str
    message: str


class InterviewStartResponse(BaseModel):
    """Shared success/error envelope for interview-start."""

    success: bool
    data: InterviewStartData | None = None
    error: ErrorBody | None = None


class EnvelopeResponse(BaseModel):
    """Generic envelope used by error handlers."""

    success: bool
    data: dict[str, Any] | None = None
    error: ErrorBody | None = None
