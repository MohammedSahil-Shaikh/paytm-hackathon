"""Text helpers for future AI pipelines."""


def truncate(text: str, max_length: int = 500) -> str:
    """Truncate text safely for logging or previews."""
    if len(text) <= max_length:
        return text
    return f"{text[: max_length - 3]}..."
