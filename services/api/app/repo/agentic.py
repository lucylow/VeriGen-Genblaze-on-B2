"""Agentic media generation and dataset-aware evaluation logic."""
import json
import logging
import time
from typing import List, Dict, Any, Optional
from genblaze_core import Pipeline, Modality, ObjectStorageSink
from .pipelines import get_storage_sink, build_image_pipeline
from ..config.settings import settings
from openai import OpenAI

logger = logging.getLogger("verigen.agentic")

class AgenticMediaEngine:
    """
    Autonomous media engine that generates, evaluates, and self-heals 
    based on dataset-aware quality metrics.
    """
    def __init__(self, evaluator_model: str = "gpt-5-mini"):
        self.client = OpenAI()
        self.evaluator_model = evaluator_model
        self.storage = get_storage_sink()

    async def run_autonomous_loop(
        self, 
        prompt: str, 
        max_retries: int = 3,
        quality_threshold: float = 0.8
    ) -> Dict[str, Any]:
        """
        Runs an autonomous loop: Generate -> Evaluate -> Refine (if needed).
        """
        current_prompt = prompt
        attempts = []
        
        for i in range(max_retries):
            logger.info(f"Autonomous attempt {i+1} for prompt: {current_prompt}")
            
            # 1. Generate
            pipeline = build_image_pipeline(prompt=current_prompt)
            result = pipeline.run(sink=self.storage)
            asset = result.run.steps[0].assets[0]
            
            # 2. Evaluate using LLM-as-a-judge (Dataset-aware)
            evaluation = self._evaluate_with_dataset_context(asset, current_prompt)
            score = evaluation.get("overall_score", 0.0)
            
            attempts.append({
                "attempt": i + 1,
                "asset_url": asset.url,
                "score": score,
                "evaluation": evaluation
            })
            
            if score >= quality_threshold:
                logger.info(f"Quality threshold met: {score}")
                break
                
            # 3. Self-Heal: Refine prompt based on feedback
            logger.info(f"Quality too low ({score}). Refining prompt...")
            current_prompt = self._refine_prompt(current_prompt, evaluation)

        winner = max(attempts, key=lambda x: x["score"])
        return {
            "winner": winner,
            "attempts": attempts,
            "final_prompt": current_prompt
        }

    def _evaluate_with_dataset_context(self, asset: Any, prompt: str) -> Dict[str, Any]:
        """
        Evaluates the asset using the built-in LLM, considering 
        dataset quality dimensions (Temporal, Detail, Fidelity).
        """
        system_prompt = (
            "You are an autonomous media evaluator. Evaluate the generated asset "
            "based on dimensions found in high-quality datasets like VidGen-1M and FineVision: "
            "1. Prompt Alignment (Robustness) "
            "2. Visual Fidelity (Quality) "
            "3. Creative Diversity "
            "Output JSON with scores (0-1) and 'overall_score'."
        )
        
        try:
            resp = self.client.chat.completions.create(
                model=self.evaluator_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Prompt: {prompt}\nAsset URL: {asset.url}"}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(resp.choices[0].message.content)
        except Exception as e:
            logger.error(f"Evaluation failed: {e}")
            return {"overall_score": 0.5, "error": str(e)}

    def _refine_prompt(self, original_prompt: str, evaluation: Dict[str, Any]) -> str:
        """Uses LLM to improve the prompt based on evaluation feedback."""
        resp = self.client.chat.completions.create(
            model=self.evaluator_model,
            messages=[
                {"role": "system", "content": "You are a prompt engineer. Improve the user prompt to fix the issues mentioned."},
                {"role": "user", "content": f"Original: {original_prompt}\nFeedback: {json.dumps(evaluation)}"}
            ]
        )
        return resp.choices[0].message.content
