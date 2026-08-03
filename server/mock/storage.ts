
import crypto from "crypto";

export async function storeMockJobManifest(
  jobId: number,
  manifest: any
): Promise<{ path: string; hash: string }> {
  const manifestJson = JSON.stringify(manifest, null, 2);
  const hash = crypto.createHash("sha256").update(manifestJson).digest("hex");
  const path = `mock://jobs/job_${jobId}/manifest.json`;

  return {
    path,
    hash,
  };
}

export async function getMockManifestUrl(jobId: number): Promise<string> {
  return `mock://jobs/job_${jobId}/manifest.json`;
}
