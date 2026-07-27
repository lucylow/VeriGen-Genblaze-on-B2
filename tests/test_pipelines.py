"""Unit tests for VeriGen core pipelines."""
import pytest
from unittest.mock import MagicMock
from verigen_v3.services.api.app.repo.pipelines import build_image_pipeline
from verigen_v3.services.api.app.repo.ai_agent import VeriGenAIAgent

def test_image_pipeline_construction():
    """Verify that the image pipeline is constructed with correct parameters."""
    prompt = "A futuristic sunset"
    pipeline = build_image_pipeline(prompt=prompt, model="test-model")
    
    assert pipeline.name == "image-generation"
    assert len(pipeline.steps) == 1
    assert pipeline.steps[0].prompt == prompt
    assert pipeline.steps[0].model == "test-model"

def test_ai_agent_optimization_fallback():
    """Verify that the AI agent falls back gracefully on error."""
    agent = VeriGenAIAgent()
    # Mocking client to force an error
    agent.client.chat.completions.create = MagicMock(side_effect=Exception("API Error"))
    
    result = agent.optimize_intent("Raw intent", "image")
    assert result["optimized_prompt"] == "Raw intent"
    assert result["suggested_model"] is None
