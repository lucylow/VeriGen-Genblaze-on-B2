import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { createJob, addCandidate, addScore, updateJobStatus, getJobHistory, getJobWithCandidates } from "./db";
import { generateMockCandidates, selectWinner } from "./mockMediaProvider";
import { storeJobManifest } from "./b2Client";
import { ENV } from "./_core/env";
import { startMockGeneration } from "./mock/pipeline";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  verigen: router({
    generateImage: protectedProcedure
      .input((val: any) => ({ prompt: val.prompt }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Create job record
          const job = await createJob(ctx.user.id, input.prompt);
          const jobId = job.id;

          if (ENV.demoMode) {
            // Start generation in background
            startMockGeneration(jobId, input.prompt);
            return { jobId };
          }

          // Update status to generating
          await updateJobStatus(jobId, "generating");

          // Generate mock candidates
          const mockCandidates = generateMockCandidates(input.prompt, jobId);
          const winner = selectWinner(mockCandidates);

          // Store candidates in database
          const candidateIds: Record<string, number> = {};
          for (const candidate of mockCandidates) {
            const result = await addCandidate(jobId, candidate.model, candidate.imageUrl);
            if (result) {
              candidateIds[candidate.model] = result.id;
              await addScore(result.id, candidate.scores);
            }
          }

          // Update status to scoring
          await updateJobStatus(jobId, "scoring");

          // Find winner candidate ID
          const winnerCandidateId = candidateIds[winner.model];

          // Store manifest in B2
          await updateJobStatus(jobId, "storage");
          const manifest = {
            jobId,
            prompt: input.prompt,
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
            sha256: "",
          };

          const { path, hash } = await storeJobManifest(jobId, manifest);

          // Mark complete
          await updateJobStatus(jobId, "complete", {
            winnerId: winnerCandidateId,
            consensusScore: winner.scores.consensusScore,
            b2JobPath: path,
            manifestHash: hash,
          });

          return {
            jobId,
            candidates: mockCandidates,
            winner,
            manifestHash: hash,
          };
        } catch (error) {
          console.error("[VeriGen] Generation failed:", error);
          throw error;
        }
      }),

    getJobHistory: protectedProcedure.query(async ({ ctx }) => {
      return await getJobHistory(ctx.user.id);
    }),

    getJobDetails: protectedProcedure
      .input((val: any) => ({ jobId: val.jobId }))
      .query(async ({ input }) => {
        return await getJobWithCandidates(input.jobId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
