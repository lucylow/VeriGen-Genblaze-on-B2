
import { generateMockCandidates, selectWinner } from "../mockMediaProvider";
import { updateMockJobStatus, addMockCandidate, getMockJob } from "./jobs";
import { storeMockJobManifest } from "./storage";

export async function startMockGeneration(jobId: number, prompt: string) {
  try {
    console.log(`[VeriGen] [Job ${jobId}] Starting generation pipeline for prompt: "${prompt}"`);

    // Simulate random failure (5% chance)
    if (Math.random() < 0.05) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      throw new Error("Simulated provider timeout");
    }

    // 1. Validate prompt (already done in router but simulate delay)
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 2. Initializing
    await updateMockJobStatus(jobId, "pending");
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 3. Generating
    await updateMockJobStatus(jobId, "generating");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const mockCandidates = generateMockCandidates(prompt, jobId);
    const candidateIds: Record<string, number> = {};
    
    for (const candidate of mockCandidates) {
      const result = await addMockCandidate(jobId, candidate);
      if (result) {
        candidateIds[candidate.model] = result.id;
      }
    }

    // 4. Scoring
    await updateMockJobStatus(jobId, "scoring");
    await new Promise((resolve) => setTimeout(resolve, 500));
    const winner = selectWinner(mockCandidates);
    const winnerCandidateId = candidateIds[winner.model];

    // 5. Storage
    await updateMockJobStatus(jobId, "storage");
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    const manifest = {
      jobId,
      prompt,
      candidates: mockCandidates.map((c) => ({
        model: c.model,
        imageUrl: c.imageUrl,
        scores: c.scores,
      })),
      winner: {
        model: winner.model,
        imageUrl: winner.imageUrl,
        consensusScore: winner.scores.consensusScore,
      },
      timestamp: new Date().toISOString(),
    };

    const { path, hash } = await storeMockJobManifest(jobId, manifest);

    // 6. Complete
    console.log(`[VeriGen] [Job ${jobId}] Generation complete. Winner: ${winner.model} (${winner.scores.consensusScore})`);
    await updateMockJobStatus(jobId, "complete", {
      winnerId: winnerCandidateId,
      winnerImageUrl: winner.imageUrl,
      consensusScore: winner.scores.consensusScore,
      b2JobPath: path,
      manifestHash: hash,
    });

  } catch (error) {
    console.error(`[VeriGen] [Job ${jobId}] Generation failed:`, error);
    console.error("[MockPipeline] Generation failed:", error);
    await updateMockJobStatus(jobId, "failed");
  }
}
