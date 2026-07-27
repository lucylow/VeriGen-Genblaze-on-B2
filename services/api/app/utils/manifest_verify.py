"""Provenance manifest verification utilities."""
import hashlib
import requests
import logging
from typing import Dict, Any, List
from genblaze_core import Manifest

logger = logging.getLogger("verigen.verify")

def verify_asset_integrity(url: str, expected_sha256: str) -> bool:
    """
    Downloads an asset and verifies its SHA-256 hash.
    """
    logger.info(f"Verifying integrity for asset: {url}")
    try:
        response = requests.get(url, stream=True, timeout=30)
        response.raise_for_status()
        
        sha256_hash = hashlib.sha256()
        for chunk in response.iter_content(chunk_size=8192):
            sha256_hash.update(chunk)
            
        actual_hash = sha256_hash.hexdigest()
        is_valid = actual_hash == expected_sha256
        
        if is_valid:
            logger.info(f"✅ Integrity verified for {url}")
        else:
            logger.error(f"❌ Hash mismatch for {url}. Expected: {expected_sha256}, Actual: {actual_hash}")
            
        return is_valid
    except Exception as e:
        logger.error(f"Verification failed for {url}: {e}")
        return False

def verify_manifest_chain(manifest_data: Dict[str, Any]) -> bool:
    """
    Verifies a Genblaze manifest's canonical hash and asset signatures.
    """
    try:
        # Reconstruct manifest object for verification
        manifest = Manifest.from_dict(manifest_data)
        return manifest.verify()
    except Exception as e:
        logger.error(f"Manifest verification error: {e}")
        return False
