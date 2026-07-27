"""Advanced Genblaze primitives: AgentLoop, Tracer, and Fallback chains."""
import logging
from typing import Any, Dict, List, Optional
from genblaze_core import (
    Pipeline, Step, Modality, Tracer, LoggingTracer, 
    AgentLoop, StreamEvent, StepFailedEvent
)
from genblaze_gmicloud import GMICloudImageProvider, GMICloudVideoProvider
from .pipelines import get_storage_sink, settings

logger = logging.getLogger("verigen.genblaze_adv")

class VeriGenTracer(Tracer):
    """Custom Genblaze Tracer for VeriGen-specific observability."""
    def on_run_start(self, run_id, name, *, tenant_id, total_steps, metadata):
        logger.info(f"🚀 [VeriGen] Run Started: {name} (ID: {run_id})")

    def on_event(self, event: StreamEvent):
        if isinstance(event, StepFailedEvent):
            logger.error(f"❌ [VeriGen] Step Failed: {event.step.model} - Error: {event.error}")
        elif event.type == "progress":
            logger.info(f"⏳ [VeriGen] Progress: {event.data.get('progress', 0)}%")

    def on_run_end(self, run_id, result):
        if result.run.success:
            logger.info(f"✅ [VeriGen] Run Completed Successfully: {run_id}")
        else:
            logger.warning(f"⚠️ [VeriGen] Run Ended with Issues: {run_id}")

def build_resilient_pipeline(
    prompt: str, 
    primary_model: str, 
    fallbacks: List[str]
) -> Pipeline:
    """
    Builds a pipeline with advanced Genblaze fallback chains.
    Ensures high availability by automatically retrying with fallback models.
    """
    tracer = VeriGenTracer()
    return (
        Pipeline("resilient-image-gen", tracer=tracer)
        .step(
            GMICloudImageProvider(),
            model=primary_model,
            prompt=prompt,
            modality=Modality.IMAGE,
            fallback_models=fallbacks,  # Genblaze native fallback
            retry_budget=2,
        )
    )

def build_refinement_loop(
    prompt: str, 
    max_iterations: int = 3
) -> AgentLoop:
    """
    Uses Genblaze AgentLoop for autonomous media refinement.
    Links runs via parent_run_id automatically.
    """
    sink = get_storage_sink()
    
    # Define the core generation step
    def generation_step(current_prompt: str) -> Pipeline:
        return Pipeline("refinement-iteration").step(
            GMICloudImageProvider(),
            model="seedream-5.0-lite",
            prompt=current_prompt,
            modality=Modality.IMAGE,
        )

    # Initialize the AgentLoop (Genblaze primitive)
    loop = AgentLoop(
        name="autonomous-refinement",
        max_iterations=max_iterations,
        sink=sink,
    )
    
    # Note: AgentLoop typically requires a 'judge' or 'critic' 
    # to decide when to stop or how to refine.
    return loop
