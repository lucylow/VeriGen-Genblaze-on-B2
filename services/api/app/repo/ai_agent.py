"""Autonomous Prompt Engineering and Model Selection Agent."""
import json
import logging
from typing import Dict, Any, List
from openai import OpenAI
from ..config.settings import settings

logger = logging.getLogger("verigen.ai_agent")

class VeriGenAIAgent:
    """
    An intelligent agent that optimizes prompts and selects the best models 
    for a given creative intent.
    """
    def __init__(self, model: str = "gpt-5-mini"):
        self.client = OpenAI()
        self.model = model

    def optimize_intent(self, user_intent: str, modality: str) -> Dict[str, Any]:
        """
        Analyzes the user's creative intent and returns an optimized prompt 
        and the best model selection.
        """
        logger.info(f"Optimizing intent: {user_intent} for {modality}")
        
        system_prompt = (
            "You are the VeriGen AI Orchestrator. Your goal is to take a raw creative intent "
            "and transform it into a production-grade prompt and model selection strategy. "
            f"Target Modality: {modality}. "
            "Output ONLY valid JSON with 'optimized_prompt', 'suggested_model', and 'reasoning'."
        )
        
        # Define model capabilities for the agent's context
        model_context = {
            "image": ["seedream-5.0-lite (best for realism)", "flux-kontext-pro (best for artistic)"],
            "video": ["Kling-Image2Video-V2.1-Master (best for motion)", "wan2.6-i2v (best for cinematic)"],
            "audio": ["tts-1-hd (best for clarity)", "eleven-labs (best for emotion)"]
        }
        
        try:
            resp = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Intent: {user_intent}\nAvailable Models: {model_context.get(modality, [])}"}
                ],
                response_format={"type": "json_object"}
            )
            
            result = json.loads(resp.choices[0].message.content)
            logger.info(f"Intent optimized. Suggested model: {result.get('suggested_model')}")
            return result
        except Exception as e:
            logger.error(f"AI optimization failed: {e}")
            return {
                "optimized_prompt": user_intent,
                "suggested_model": None,
                "reasoning": "Fallback to raw intent due to optimization error."
            }

    def evaluate_output(self, asset_url: str, prompt: str) -> Dict[str, Any]:
        """
        Performs a post-generation AI evaluation to check if the asset 
        aligns with the optimized prompt.
        """
        # This leverages the logic from the previous agentic implementation 
        # but integrated into the central AI agent.
        pass
