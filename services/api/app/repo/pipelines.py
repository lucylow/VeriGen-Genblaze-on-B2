"""Genblaze pipeline builders – the sole location for genblaze imports."""
from typing import Optional, List
from genblaze_core import (
    Pipeline, Modality, ObjectStorageSink, KeyStrategy,
    PipelineResult
)
from genblaze_s3 import S3StorageBackend
from genblaze_gmicloud import (
    GMICloudImageProvider,
    GMICloudVideoProvider
)
from genblaze_openai import DalleProvider, OpenAITTSProvider

from ..config.settings import settings

# --- Shared storage sink (reused across all pipelines) ---
# Note: Using a lazy loader for storage to avoid issues if keys aren't set during import
def get_storage_sink() -> ObjectStorageSink:
    return ObjectStorageSink(
        S3StorageBackend.for_backblaze(settings.B2_BUCKET_NAME),
        key_strategy=KeyStrategy.HIERARCHICAL,
    )


def build_image_pipeline(
    prompt: str,
    model: str = settings.DEFAULT_IMAGE_MODEL,
    aspect_ratio: str = "16:9",
    seed: Optional[int] = None,
) -> Pipeline:
    """Build a text‑to‑image pipeline using GMICloud."""
    return (
        Pipeline("image-generation")
        .step(
            GMICloudImageProvider(),
            model=model,
            prompt=prompt,
            modality=Modality.IMAGE,
            aspect_ratio=aspect_ratio,
            seed=seed,
        )
    )


def build_iteration_pipeline(
    parent_result: PipelineResult,
    refine_prompt: str,
    image_model: str = "flux-kontext-pro",
) -> Pipeline:
    """
    Build an iteration/refinement pipeline based on a parent run.
    Uses parent_run_id for provenance tracking.
    """
    return (
        Pipeline("image-refinement")
        .from_result(parent_result)  # Links to parent run via parent_run_id
        .step(
            GMICloudImageProvider(),
            model=image_model,
            prompt=refine_prompt,
            modality=Modality.IMAGE,
            aspect_ratio="16:9",
        )
    )


def build_video_fanout_pipeline(
    image_result: PipelineResult,
    video_models: List[str] = settings.DEFAULT_VIDEO_MODELS,
    prompt: str = "camera slowly pans right",
) -> Pipeline:
    """
    Build a fan‑out pipeline that generates multiple videos
    from a single approved image, running concurrently.
    """
    pipeline = Pipeline("video-fanout")
    
    for model in video_models:
        pipeline = pipeline.step(
            GMICloudVideoProvider(),
            model=model,
            prompt=prompt,
            modality=Modality.VIDEO,
            duration=5,
            aspect_ratio="16:9",
            input_image=image_result.run.steps[0].assets[0].url,  # Image‑to‑video
        )
    
    return pipeline
