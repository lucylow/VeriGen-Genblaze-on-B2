# VeriGen - Advanced Genblaze + B2 Media Pipeline

This is an advanced, production-ready implementation of the **VeriGen** AI media pipeline, deeply integrated with the Genblaze SDK and Backblaze B2.

## Key Features

- **Layered Architecture**: Clear separation between pipeline orchestration, API routes, and configuration.
- **Advanced Provenance**: Full SHA-256 provenance tracking for every run, stored in B2.
- **Multi-Step & Fan-out**: Supports complex workflows like Image -> Video fan-out across multiple models.
- **SSE Streaming**: Real-time progress updates for generation tasks via Server-Sent Events.
- **Iteration Support**: Chain runs together using `parent_run_id` for continuous refinement.
- **Autonomous Media Engine**: Self-healing loop that generates, evaluates using LLM-as-a-judge, and automatically refines prompts to meet quality thresholds.
- **Dataset-Aware Evaluation**: Scoring based on modern dataset dimensions (Temporal Consistency, Visual Fidelity, Prompt Alignment).
- **TalkCuts Integration**: Specialized pipeline for multi-shot human speech video generation (TTS + Image-to-Video).
- **MovieBench Orchestration**: Advanced scene-based orchestration for long-form video generation with consistent narrative style.

## Project Structure

- `services/api/app/repo/pipelines.py`: Centralized Genblaze pipeline logic.
- `services/api/app/runtime/routes.py`: FastAPI routes for media generation.
- `services/api/app/config/settings.py`: Pydantic-based configuration management.

## Getting Started

1. Install dependencies:
   ```bash
   pip install -r services/api/requirements.txt
   ```
2. Configure your `.env` with Backblaze B2 and GMICloud credentials.
3. Run the API:
   ```bash
   uvicorn services.api.app.main:app --reload
   ```
