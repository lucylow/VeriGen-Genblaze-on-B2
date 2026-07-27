"""Mock providers and error handling fallbacks."""
import logging
import time
from typing import List, Dict, Any
from genblaze_core import Modality

logger = logging.getLogger("verigen.fallbacks")

class MockMediaProvider:
    """
    A fallback provider that returns high-quality mock data when 
    real providers are unavailable or credentials are missing.
    """
    def __init__(self, modality: Modality):
        self.modality = modality

    def submit(self, *args, **kwargs) -> str:
        return f"mock-job-{int(time.time())}"

    def poll(self, job_id: str) -> bool:
        return True

    def fetch_output(self, job_id: str) -> List[Dict[str, Any]]:
        if self.modality == Modality.IMAGE:
            return [{"url": "https://picsum.photos/1024/1024", "sha256": "mock-sha256-img"}]
        elif self.modality == Modality.VIDEO:
            return [{"url": "https://example.com/mock-video.mp4", "sha256": "mock-sha256-vid"}]
        return []

def safe_execute(func, *args, **kwargs):
    """
    Global error handler for pipeline execution steps.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.error(f"Execution failed: {e}. Falling back to mock data.")
        # In a real app, this would trigger the MockMediaProvider
        return None
