import { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";
import type { AppRouter } from "../../../server/routers";
import * as mockData from "../../../shared/mock";

export const mockTrpcLink: TRPCLink<AppRouter> = () => {
  return ({ op }) => {
    return observable((observer) => {
      const { path, input, type } = op;
      console.log(`[Mock TRPC] ${type} ${path}`, input);

      const handleMockRequest = async () => {
        // Simulate network latency
        await mockData.sleep(500 + Math.random() * 500);

        let result: any;

        if (path === "auth.me") {
          result = mockData.MOCK_USERS[0];
        } else if (path === "verigen.getJobHistory") {
          result = mockData.MOCK_JOBS;
        } else if (path === "verigen.getJobDetails") {
          const jobId = (input as any).jobId;
          result = mockData.MOCK_JOBS.find(j => j.id === jobId) || mockData.MOCK_JOBS[0];
        } else if (path === "verigen.generateImage") {
          // Special handling for generation to simulate progress
          // In a real app, this might return a jobId and the client polls
          // For this mock, we'll just return the final result after a delay
          const prompt = (input as any).prompt;
          const candidates = [
            {
              id: Math.floor(Math.random() * 1000),
              jobId: 999,
              model: "openai",
              imageUrl: mockData.generateMockImage("openai", prompt),
              scores: mockData.generateRealisticScores("openai"),
            },
            {
              id: Math.floor(Math.random() * 1000),
              jobId: 999,
              model: "claude",
              imageUrl: mockData.generateMockImage("claude", prompt),
              scores: mockData.generateRealisticScores("claude"),
            }
          ];
          
          result = {
            jobId: 999,
            candidates,
            winner: candidates[0],
            manifestHash: "mock-hash-" + Date.now(),
          };
        } else {
          // Fallback for other routes
          result = { success: true, mock: true };
        }

        observer.next({
          result: {
            data: result,
          },
        });
        observer.complete();
      };

      handleMockRequest().catch((err) => {
        observer.error(err);
      });
    });
  };
};
