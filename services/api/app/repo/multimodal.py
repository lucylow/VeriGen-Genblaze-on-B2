"""Advanced video and multimodal orchestration engine."""
import logging
from typing import List, Optional
from genblaze_core import Pipeline, Modality, PipelineResult
from genblaze_gmicloud import GMICloudVideoProvider
from genblaze_openai import OpenAITTSProvider
from .pipelines import get_storage_sink, build_image_pipeline
from ..config.settings import settings

logger = logging.getLogger("verigen.multimodal")

def build_talkcuts_pipeline(
    text: str, 
    image_url: str,
    voice: str = "nova"
) -> Pipeline:
    """
    Build a TalkCuts-style human speech video pipeline.
    Combines TTS with image-to-video animation.
    """
    return (
        Pipeline("talkcuts-speech-video", chain=True)
        .step(
            OpenAITTSProvider(),
            model="tts-1-hd",
            prompt=text,
            modality=Modality.AUDIO,
            voice=voice,
        )
        .step(
            GMICloudVideoProvider(),
            model="Kling-Image2Video-V2.1-Master",
            prompt=f"Human speaking the following text: {text[:50]}...",
            modality=Modality.VIDEO,
            input_image=image_url,
            duration=10,
        )
    )

def build_moviebench_long_video_pipeline(
    scenes: List[dict],
    base_style_prompt: str
) -> Pipeline:
    """
    Orchestrate long-form video generation by stitching multiple scenes.
    Inspired by MovieBench for consistent narrative flow.
    """
    pipeline = Pipeline("moviebench-long-video", chain=True)
    
    for i, scene in enumerate(scenes):
        full_prompt = f"{base_style_prompt}. Scene {i+1}: {scene['prompt']}"
        pipeline = pipeline.step(
            GMICloudVideoProvider(),
            model=scene.get("model", "Kling-Image2Video-V2.1-Master"),
            prompt=full_prompt,
            modality=Modality.VIDEO,
            duration=scene.get("duration", 5),
            aspect_ratio="16:9",
        )
    
    return pipeline

def build_multimodal_consensus_pipeline(
    prompt: str,
    image_models: List[str],
    video_models: List[str]
) -> Pipeline:
    """
    Parallel multimodal consensus: generates multiple images, 
    then fans out to multiple video models for each image.
    """
    pipeline = Pipeline("multimodal-consensus")
    
    # 1. Generate candidate images in parallel
    for model in image_models:
        pipeline = pipeline.step(
            build_image_pipeline(prompt=prompt, model=model).steps[0].provider,
            model=model,
            prompt=prompt,
            modality=Modality.IMAGE,
        )
        
    # Note: In a real production scenario, we would evaluate these 
    # before fanning out, but here we show the structural orchestration.
    return pipeline
