from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Backblaze B2 - S3-compatible endpoint
    B2_ENDPOINT: str = "https://s3.us-west-004.backblazeb2.com"
    B2_REGION: str = "us-west-004"
    B2_KEY_ID: str = ""
    B2_APPLICATION_KEY: str = ""
    B2_BUCKET_NAME: str = "verigen-assets"
    
    # GMICloud API (for image/video models)
    GMI_API_KEY: str = ""
    
    # Optional: OpenAI (for DALL-E, Sora, TTS)
    OPENAI_API_KEY: Optional[str] = None
    
    # Pipeline defaults
    DEFAULT_IMAGE_MODEL: str = "seedream-5.0-lite"
    DEFAULT_VIDEO_MODELS: List[str] = [
        "Kling-Image2Video-V2.1-Master",
        "wan2.6-i2v",
        "pixverse-v5.6-i2v"
    ]
    PIPELINE_TIMEOUT: int = 600
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
