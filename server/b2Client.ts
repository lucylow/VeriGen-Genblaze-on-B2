import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// B2 credentials from environment
const B2_KEY_ID = "005dc9ca6a40f4b0000000001";
const B2_APPLICATION_KEY = "K005BNQ6ds7LWEpwmD/1e/AKplkgSmA";
const B2_ENDPOINT = "https://s3.us-west-004.backblazeb2.com";
const B2_REGION = "us-west-004";
const B2_BUCKET_NAME = "verigen-assets";

// Initialize S3 client for Backblaze B2
const s3Client = new S3Client({
  region: B2_REGION,
  endpoint: B2_ENDPOINT,
  credentials: {
    accessKeyId: B2_KEY_ID,
    secretAccessKey: B2_APPLICATION_KEY,
  },
});

export interface ManifestData {
  jobId: number;
  prompt: string;
  candidates: Array<{
    model: string;
    imageUrl: string;
    scores: {
      promptAdherence: number;
      visualQuality: number;
      robustness: number;
      diversity: number;
      consensusScore: number;
    };
  }>;
  winner: {
    model: string;
    imageUrl: string;
    consensusScore: number;
  };
  timestamp: string;
  sha256: string;
}

/**
 * Store job manifest and provenance data in B2
 */
export async function storeJobManifest(
  jobId: number,
  manifest: Omit<ManifestData, "sha256">
): Promise<{ path: string; hash: string }> {
  try {
    const manifestJson = JSON.stringify(manifest, null, 2);
    const hash = crypto.createHash("sha256").update(manifestJson).digest("hex");

    const key = `jobs/job_${jobId}/manifest.json`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: key,
        Body: manifestJson,
        ContentType: "application/json",
      })
    );

    return {
      path: `s3://${B2_BUCKET_NAME}/${key}`,
      hash,
    };
  } catch (error) {
    console.error("[B2] Failed to store manifest:", error);
    throw error;
  }
}

/**
 * Get signed URL for manifest retrieval
 */
export async function getManifestUrl(jobId: number): Promise<string> {
  try {
    const key = `jobs/job_${jobId}/manifest.json`;
    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: key,
      }),
      { expiresIn: 86400 } // 24 hours
    );
    return url;
  } catch (error) {
    console.error("[B2] Failed to get manifest URL:", error);
    throw error;
  }
}

/**
 * Store candidate image in B2
 */
export async function storeCandidateImage(
  jobId: number,
  model: string,
  imageData: Buffer
): Promise<string> {
  try {
    const key = `jobs/job_${jobId}/candidates/${model}.png`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: key,
        Body: imageData,
        ContentType: "image/png",
      })
    );

    return `s3://${B2_BUCKET_NAME}/${key}`;
  } catch (error) {
    console.error("[B2] Failed to store candidate image:", error);
    throw error;
  }
}
