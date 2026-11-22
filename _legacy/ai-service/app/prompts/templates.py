"""Placeholder prompt templates.

Interview-start prompts live in `app.prompts.interview_start`.
Other templates remain reserved for later AI milestones.
"""

from app.prompts.interview_start import INTERVIEW_START_SYSTEM_PROMPT

QUESTION_GENERATION_PROMPT = INTERVIEW_START_SYSTEM_PROMPT

ANSWER_EVALUATION_PROMPT = """
You are an expert interviewer evaluating a candidate response.
Score correctness, clarity, and depth with concise rationale.
""".strip()

INTERVIEW_FEEDBACK_PROMPT = """
Summarize interview performance into strengths, improvements, and a hiring recommendation.
""".strip()
