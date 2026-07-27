from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import Optional, List
import json
import asyncio

from ..repo.pipelines import (
    build_image_pipeline,
    build_iteration_pipeline,
    build_video_fanout_pipeline,
    get_storage_sink,
    settings,
)
from ..repo.agentic import AgenticMediaEngine
from ..repo.multimodal import build_talkcuts_pipeline, build_moviebench_long_video_pipeline
from ..repo.ai_agent import VeriGenAIAgent
from ..repo.genblaze_adv import build_resilient_pipeline, VeriGenTracer
from ..utils.fallbacks import safe_execute, MockMediaProvider

router = APIRouter(prefix="/api/v1", tags=["pipelines"])

# In‑memory cache for pipeline results
_result_cache = {}

@router.post("/generate/image")
async def generate_image(prompt: str, run_id: str, optimize: bool = False, resilient: bool = True):
    """Generate an image with AI optimization and optional resiliency."""
    final_prompt = prompt
    model = settings.DEFAULT_IMAGE_MODEL
    
    if optimize:
        agent = VeriGenAIAgent()
        optimization = agent.optimize_intent(prompt, "image")
        final_prompt = optimization.get("optimized_prompt", prompt)

    if resilient:
        # Use advanced Genblaze fallback chains
        fallbacks = ["flux-schnell", "sdxl-turbo"]
        pipeline = build_resilient_pipeline(final_prompt, model, fallbacks)
    else:
        pipeline = build_image_pipeline(prompt=final_prompt, model=model)
        
    return StreamingResponse(
        stream_pipeline(pipeline, run_id),
        media_type="text/event-stream"
    )

@router.post("/generate/autonomous")
async def generate_autonomous(prompt: str):
    """Run an autonomous generation-evaluation-refinement loop."""
    engine = AgenticMediaEngine()
    result = await engine.run_autonomous_loop(prompt)
    return result

@router.post("/generate/talkcuts")
async def generate_talkcuts(text: str, image_url: str):
    """Generate a human speech video (TalkCuts style)."""
    pipeline = build_talkcuts_pipeline(text=text, image_url=image_url)
    return StreamingResponse(
        stream_pipeline(pipeline, f"talkcuts-{int(time.time())}"),
        media_type="text/event-stream"
    )

@router.post("/generate/moviebench")
async def generate_moviebench(scenes: List[dict], style: str):
    """Generate a long-form video from multiple scenes (MovieBench style)."""
    pipeline = build_moviebench_long_video_pipeline(scenes=scenes, base_style_prompt=style)
    return StreamingResponse(
        stream_pipeline(pipeline, f"moviebench-{int(time.time())}"),
        media_type="text/event-stream"
    )

async def stream_pipeline(pipeline, run_id: str, parent_id: Optional[str] = None):
    sink = get_storage_sink()
    try:
        async for event in pipeline.stream(sink=sink, timeout=settings.PIPELINE_TIMEOUT):
            yield f"event: {event.type}\n"
            yield f"data: {json.dumps(event.model_dump())}\n\n"
    except Exception as e:
        logger.error(f"Pipeline Stream Error: {e}")
        yield f"event: error\n"
        yield f"data: {json.dumps({'error': 'Pipeline failed. Check credentials or provider status.', 'details': str(e)})}\n\n"
            
            if event.type == "complete":
                result = event.data.get("result")
                if result:
                    _result_cache[run_id] = result
                    yield f"event: manifest\n"
                    yield f"data: {json.dumps({'manifest_uri': result.manifest.manifest_uri})}\n\n"
    except Exception as e:
        yield f"event: error\n"
        yield f"data: {json.dumps({'error': str(e)})}\n\n"
