"""Interview AI API routes."""

from fastapi import APIRouter, Depends

from app.schemas.interview import InterviewStartRequest, InterviewStartResponse
from app.services.interview_ai import InterviewAIService, get_interview_ai_service

router = APIRouter(prefix="/ai/interview", tags=["interview"])


@router.post("/start", response_model=InterviewStartResponse)
async def start_interview(
    payload: InterviewStartRequest,
    service: InterviewAIService = Depends(get_interview_ai_service),
) -> InterviewStartResponse:
    """Start an AI interview and return exactly 5 role-relevant questions.

    Uses supplied company research when present; otherwise mock research.
    """
    data = await service.start_interview(payload)
    return InterviewStartResponse(success=True, data=data, error=None)
