"""Company research helpers.

Uses supplied research when available. Falls back to mock research when the
external research module/API is not integrated yet.
"""

from app.schemas.interview import CompanyResearchInput

_MOCK_COMPANY_LIBRARY: dict[str, CompanyResearchInput] = {
    "paytm": CompanyResearchInput(
        company_name="Paytm",
        overview=(
            "Paytm is an Indian fintech platform focused on digital payments, "
            "merchant acquiring, lending, and financial services for consumers "
            "and businesses."
        ),
        products=[
            "UPI payments",
            "Merchant QR checkout",
            "Wallet and payment gateway",
            "Credit and lending products",
        ],
        culture_signals=[
            "High ownership",
            "Fast experimentation",
            "Customer trust and reliability",
            "Scale-first engineering",
        ],
        recent_focus=[
            "Payment reliability at scale",
            "Merchant growth",
            "Risk and fraud controls",
            "Cost-efficient cloud systems",
        ],
        source="mock_research",
    ),
}


def get_company_research(
    target_company: str,
    provided: CompanyResearchInput | None = None,
) -> CompanyResearchInput:
    """Return provided research or a deterministic mock fallback."""
    if provided is not None:
        return provided.model_copy(
            update={
                "company_name": provided.company_name or target_company,
                "source": provided.source or "provided",
            }
        )

    key = target_company.strip().lower()
    if key in _MOCK_COMPANY_LIBRARY:
        return _MOCK_COMPANY_LIBRARY[key]

    return CompanyResearchInput(
        company_name=target_company,
        overview=(
            f"{target_company} is a technology-driven organization. Detailed live "
            "research is not integrated yet, so this mock context focuses on "
            "product quality, customer impact, and role-relevant execution."
        ),
        products=["Core product platform", "Internal tooling", "Customer-facing services"],
        culture_signals=[
            "Collaboration",
            "Bias for action",
            "Clear communication",
            "Quality ownership",
        ],
        recent_focus=[
            "Platform reliability",
            "Customer experience",
            "Operational excellence",
        ],
        source="mock_research",
    )
