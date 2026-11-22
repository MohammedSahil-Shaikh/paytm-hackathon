"""Health endpoint smoke tests."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_endpoint() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "service": "ai-service",
        "status": "healthy",
    }
