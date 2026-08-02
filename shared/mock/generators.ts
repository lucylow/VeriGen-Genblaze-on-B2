import { MockCandidate } from "../../server/mockMediaProvider";

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function generateRealisticScores(model: string) {
  const base = {
    openai: { prompt: 90, visual: 92, robust: 88, diversity: 85 },
    claude: { prompt: 94, visual: 90, robust: 92, diversity: 88 },
    gemini: { prompt: 88, visual: 85, robust: 85, diversity: 90 },
    flux: { prompt: 92, visual: 95, robust: 80, diversity: 82 },
  }[model] || { prompt: 85, visual: 85, robust: 85, diversity: 85 };

  const variance = () => (Math.random() - 0.5) * 10;
  
  const promptAdherence = Math.min(100, Math.max(0, Math.round(base.prompt + variance())));
  const visualQuality = Math.min(100, Math.max(0, Math.round(base.visual + variance())));
  const robustness = Math.min(100, Math.max(0, Math.round(base.robust + variance())));
  const diversity = Math.min(100, Math.max(0, Math.round(base.diversity + variance())));

  const consensusScore = Math.round(
    (promptAdherence * 0.4 + visualQuality * 0.25 + robustness * 0.2 + diversity * 0.15)
  );

  return {
    promptAdherence,
    visualQuality,
    robustness,
    diversity,
    consensusScore,
  };
}

export function generateMockImage(model: string, prompt: string): string {
  // Use local bundled assets for demo mode
  const index = Math.floor(Math.random() * 20) + 1;
  return `/mock/sample-${index}.svg`;
}

export async function simulateWorkflow(onProgress: (status: string, progress: number) => void) {
  const stages = [
    { status: "uploading", label: "Uploading request", duration: 400 },
    { status: "orchestrating", label: "Creating workflow", duration: 600 },
    { status: "scheduling", label: "Scheduling jobs", duration: 800 },
    { status: "dispatching", label: "Dispatching providers", duration: 1200 },
    { status: "generating", label: "Generating assets", duration: 2500 },
    { status: "validating", label: "Validation", duration: 900 },
    { status: "consensus", label: "Consensus Engine", duration: 1100 },
    { status: "scoring", label: "Scoring models", duration: 700 },
    { status: "storage", label: "Backblaze B2 Storage", duration: 1500 },
    { status: "complete", label: "Completed", duration: 200 },
  ];

  let totalProgress = 0;
  for (const stage of stages) {
    onProgress(stage.label, totalProgress);
    await sleep(stage.duration);
    totalProgress += 10;
  }
}
