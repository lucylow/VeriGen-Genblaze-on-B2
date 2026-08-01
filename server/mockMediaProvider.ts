/**
 * Mock media provider generates placeholder images and realistic consensus scores
 * Used when real AI providers are unavailable
 */

export interface MockCandidate {
  model: string;
  imageUrl: string;
  scores: {
    promptAdherence: number;
    visualQuality: number;
    robustness: number;
    diversity: number;
    consensusScore: number;
  };
}

/**
 * Generate a mock SVG image as a placeholder
 */
function generateMockSvg(model: string, prompt: string): string {
  const colors: Record<string, string> = {
    openai: "#10a37f",
    gemini: "#4285f4",
    replicate: "#ff6b6b",
    gmi: "#9b59b6",
  };

  const color = colors[model] || "#666";
  const modelLabel = model.toUpperCase();

  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
        <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#grad)" />
    <circle cx="256" cy="256" r="120" fill="${color}" opacity="0.2" />
    <circle cx="256" cy="256" r="80" fill="${color}" opacity="0.1" />
    <text x="256" y="240" font-size="32" font-weight="bold" text-anchor="middle" fill="${color}">
      ${modelLabel}
    </text>
    <text x="256" y="280" font-size="14" text-anchor="middle" fill="${color}" opacity="0.7">
      Mock Generation
    </text>
    <text x="256" y="310" font-size="12" text-anchor="middle" fill="#666" opacity="0.5">
      ${prompt.substring(0, 40)}${prompt.length > 40 ? "..." : ""}
    </text>
  </svg>`;
}

/**
 * Generate realistic mock scores for a candidate
 */
function generateMockScores(
  model: string,
  seed: number
): {
  promptAdherence: number;
  visualQuality: number;
  robustness: number;
  diversity: number;
  consensusScore: number;
} {
  // Use seed to generate consistent but varied scores
  const hash = (seed * 73856093) ^ (model.charCodeAt(0) * 19349663);
  const random = (Math.sin(hash) * 10000) % 1;

  // Different models have different score distributions
  const modelBias: Record<string, { prompt: number; visual: number; robust: number; div: number }> = {
    openai: { prompt: 0.85, visual: 0.88, robust: 0.82, div: 0.75 },
    gemini: { prompt: 0.80, visual: 0.85, robust: 0.80, div: 0.78 },
    replicate: { prompt: 0.75, visual: 0.80, robust: 0.75, div: 0.82 },
    gmi: { prompt: 0.82, visual: 0.83, robust: 0.78, div: 0.80 },
  };

  const bias = modelBias[model] || { prompt: 0.80, visual: 0.80, robust: 0.80, div: 0.80 };

  const promptAdherence = Math.round((bias.prompt + (random - 0.5) * 0.2) * 100);
  const visualQuality = Math.round((bias.visual + (random - 0.5) * 0.2) * 100);
  const robustness = Math.round((bias.robust + (random - 0.5) * 0.2) * 100);
  const diversity = Math.round((bias.div + (random - 0.5) * 0.2) * 100);

  // Consensus score: 0.4*prompt + 0.25*visual + 0.2*robust + 0.15*diversity
  const consensusScore = Math.round(
    (promptAdherence * 0.4 +
      visualQuality * 0.25 +
      robustness * 0.2 +
      diversity * 0.15) /
      100
  );

  return {
    promptAdherence: Math.max(0, Math.min(100, promptAdherence)),
    visualQuality: Math.max(0, Math.min(100, visualQuality)),
    robustness: Math.max(0, Math.min(100, robustness)),
    diversity: Math.max(0, Math.min(100, diversity)),
    consensusScore: Math.max(0, Math.min(100, consensusScore)),
  };
}

/**
 * Generate mock candidates for a prompt
 */
export function generateMockCandidates(
  prompt: string,
  jobId: number
): MockCandidate[] {
  const models = ["openai", "gemini", "replicate", "gmi"];
  const seed = jobId * 12345;

  return models.map((model) => {
    const svg = generateMockSvg(model, prompt);
    const dataUrl = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

    return {
      model,
      imageUrl: dataUrl,
      scores: generateMockScores(model, seed + models.indexOf(model)),
    };
  });
}

/**
 * Select winner based on consensus scores
 */
export function selectWinner(candidates: MockCandidate[]): MockCandidate {
  return candidates.reduce((best, current) =>
    current.scores.consensusScore > best.scores.consensusScore ? current : best
  );
}
