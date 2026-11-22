"""Small reusable helpers."""


def normalize_prefix(prefix: str) -> str:
    """Ensure an API prefix starts with a single leading slash."""
    cleaned = prefix.strip()
    if not cleaned:
        return "/api/v1"
    return cleaned if cleaned.startswith("/") else f"/{cleaned}"
