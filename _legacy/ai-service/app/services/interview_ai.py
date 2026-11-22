"""AI interview orchestration service.

First deliverable: interview-start with mock/deterministic question generation.
Later milestones: adaptive follow-ups, evaluation, reports, onboarding, HR assist.
"""

from __future__ import annotations

import logging
import re
import uuid
from app.core.exceptions import AIServiceError
from app.prompts.interview_start import (
    INTERVIEW_START_SYSTEM_PROMPT,
    INTERVIEW_START_USER_PROMPT,
)
from app.providers.base import LLMProvider, get_llm_provider
from app.schemas.interview import (
    Difficulty,
    InterviewQuestion,
    InterviewStartData,
    InterviewStartRequest,
    QuestionCategory,
)
from app.services.research import get_company_research
from app.utils.text import truncate

logger = logging.getLogger(__name__)


class InterviewAIService:
    """Coordinates AI providers for interview workflows."""

    def __init__(self, provider: LLMProvider | None = None) -> None:
        self.provider = provider or get_llm_provider()

    async def ready(self) -> bool:
        """Check whether an LLM provider is configured."""
        return await self.provider.is_ready()

    async def start_interview(self, payload: InterviewStartRequest) -> InterviewStartData:
        """Generate a personalized 5-question interview set.

        Uses mock generation for the foundation stage. Prompt templates are
        prepared so a real provider can plug in without changing the API shape.
        """
        research = get_company_research(payload.target_company, payload.company_research)

        # Prompt material is built now so future LLM wiring stays isolated here.
        _ = self._build_prompt(payload, research)

        try:
            if await self.provider.is_ready():
                # Provider integrations are not implemented yet; fall back safely.
                logger.info(
                    "LLM provider reported ready, but generation is not implemented; "
                    "using mock interview-start generator."
                )
            questions = self._generate_mock_questions(payload, research.company_name)
            data = InterviewStartData(
                interview_id=f"int_{uuid.uuid4().hex[:10]}",
                target_company=payload.target_company,
                target_role=payload.target_role,
                question_count=len(questions),
                research_source=research.source,
                company_research=research,
                questions=questions,
            )
        except ValueError as exc:
            raise AIServiceError(
                message=str(exc),
                code="INTERVIEW_GENERATION_INVALID",
                status_code=500,
            ) from exc
        except Exception as exc:  # pragma: no cover - defensive envelope
            logger.exception("Interview-start generation failed")
            raise AIServiceError(
                message="Failed to generate interview questions.",
                code="INTERVIEW_GENERATION_FAILED",
                status_code=500,
            ) from exc

        logger.info(
            "Generated interview-start set interview_id=%s role=%s company=%s source=%s",
            data.interview_id,
            data.target_role,
            data.target_company,
            data.research_source,
        )
        return data

    def _build_prompt(self, payload: InterviewStartRequest, research) -> dict[str, str]:
        """Assemble maintainable prompts for future LLM calls."""
        skills = ", ".join(payload.candidate.skills) or "not specified"
        requirements = ", ".join(payload.job_requirements) or "not specified"
        user_prompt = INTERVIEW_START_USER_PROMPT.format(
            candidate_name=payload.candidate.name,
            experience_years=payload.candidate.experience_years,
            skills=skills,
            education=payload.candidate.education or "not specified",
            summary=payload.candidate.summary or "not specified",
            resume_text=truncate(payload.candidate.resume_text or "not provided", 4000),
            target_company=payload.target_company,
            target_role=payload.target_role,
            job_requirements=requirements,
            interview_type=payload.interview_type,
            research_source=research.source,
            company_overview=research.overview,
            company_products=", ".join(research.products) or "not specified",
            culture_signals=", ".join(research.culture_signals) or "not specified",
            recent_focus=", ".join(research.recent_focus) or "not specified",
        )
        return {
            "system": INTERVIEW_START_SYSTEM_PROMPT,
            "user": user_prompt,
        }

    def _generate_mock_questions(
        self,
        payload: InterviewStartRequest,
        company_name: str,
    ) -> list[InterviewQuestion]:
        """Deterministic mock generator that stays role/company specific."""
        role = payload.target_role.strip()
        skills = self._pick_skills(payload)
        requirements = payload.job_requirements or skills
        primary_skill = skills[0]
        secondary_skill = skills[1] if len(skills) > 1 else requirements[0]
        requirement_focus = requirements[0]
        difficulty = self._difficulty_for_experience(payload.candidate.experience_years)
        advanced = Difficulty.HARD if difficulty == Difficulty.HARD else Difficulty.MID

        focus_area = self._infer_gap_or_focus(payload, skills, requirements)
        product_hint = self._product_hint(company_name)

        drafts: list[tuple[str, str, Difficulty, QuestionCategory, str]] = [
            (
                f"Walk through how you would design and harden a production feature "
                f"involving {primary_skill} for a {role} at {company_name}. "
                f"Call out APIs, data flow, failure modes, and monitoring.",
                primary_skill.lower().replace(" ", "_"),
                difficulty,
                QuestionCategory.TECHNICAL,
                f"Anchored on candidate skill '{primary_skill}' and role '{role}'.",
            ),
            (
                f"Tell me about a time you had to deliver under ambiguity while working "
                f"with stakeholders on a {role}-related initiative. How did you "
                f"communicate trade-offs and keep delivery moving?",
                "stakeholder_collaboration",
                difficulty,
                QuestionCategory.BEHAVIORAL,
                "Behavioral signal for ownership and communication under ambiguity.",
            ),
            (
                f"{company_name}'s {product_hint} starts degrading during peak traffic. "
                f"As a {role}, how would you diagnose the issue, prioritize mitigations, "
                f"and decide what to fix first using {secondary_skill}?",
                "incident_triage",
                advanced,
                QuestionCategory.PROBLEM_SOLVING,
                f"Company-contextual problem solving using {secondary_skill}.",
            ),
            (
                f"For the {role} role at {company_name}, which part of the job requirements "
                f"around '{requirement_focus}' maps strongest to your experience, and where "
                f"would you need the most ramp-up in the first 30 days?",
                "role_fit",
                difficulty,
                QuestionCategory.ROLE_COMPANY,
                "Role/company fit against stated job requirements.",
            ),
            (
                f"Given your background, dig into {focus_area}: how would you approach a "
                f"{role} task at {company_name} that depends on {focus_area}, and what "
                f"evidence from past work proves you can handle it?",
                self._slug(focus_area),
                advanced,
                QuestionCategory.TECHNICAL,
                f"Deepens likely focus/gap area '{focus_area}'.",
            ),
        ]

        questions: list[InterviewQuestion] = []
        for index, (text, topic, level, category, rationale) in enumerate(drafts, start=1):
            questions.append(
                InterviewQuestion(
                    id=f"q_{index:03d}",
                    text=text,
                    topic=topic,
                    difficulty=level,
                    category=category,
                    rationale=rationale,
                )
            )
        return questions

    def _pick_skills(self, payload: InterviewStartRequest) -> list[str]:
        skills = [skill for skill in payload.candidate.skills if skill.strip()]
        if skills:
            return skills
        if payload.job_requirements:
            return list(payload.job_requirements)
        resume_tokens = self._skills_from_resume(payload.candidate.resume_text)
        if resume_tokens:
            return resume_tokens
        return ["core programming", "system design"]

    def _skills_from_resume(self, resume_text: str) -> list[str]:
        if not resume_text:
            return []
        known = [
            "Python",
            "Java",
            "JavaScript",
            "TypeScript",
            "React",
            "Node.js",
            "FastAPI",
            "Django",
            "SQL",
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "Kafka",
            "AWS",
            "Docker",
            "Kubernetes",
            "System Design",
            "APIs",
        ]
        found = [skill for skill in known if re.search(rf"\b{re.escape(skill)}\b", resume_text, re.I)]
        return found[:5]

    def _infer_gap_or_focus(
        self,
        payload: InterviewStartRequest,
        skills: list[str],
        requirements: list[str],
    ) -> str:
        skill_set = {skill.lower() for skill in skills}
        for requirement in requirements:
            if requirement.lower() not in skill_set:
                return requirement
        if payload.candidate.experience_years < 2:
            return requirements[0] if requirements else "fundamentals"
        return skills[min(1, len(skills) - 1)]

    def _difficulty_for_experience(self, years: float) -> Difficulty:
        if years < 2:
            return Difficulty.EASY
        if years < 5:
            return Difficulty.MID
        return Difficulty.HARD

    def _product_hint(self, company_name: str) -> str:
        if company_name.strip().lower() == "paytm":
            return "UPI checkout path"
        return "customer-facing service"

    def _slug(self, value: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "_", value.strip().lower())
        return slug.strip("_") or "focus_area"


def get_interview_ai_service() -> InterviewAIService:
    """Factory used by API routes."""
    return InterviewAIService()
