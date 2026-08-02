import { Job, Candidate, Score, User } from "../types";

export const MOCK_USERS: User[] = [
  {
    id: 1,
    openId: "demo-user-1",
    name: "Alex Rivera",
    email: "alex.rivera@acme.ai",
    loginMethod: "github",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  {
    id: 2,
    openId: "demo-user-2",
    name: "Sarah Chen",
    email: "s.chen@nova-health.org",
    loginMethod: "google",
    role: "user",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
];

export const MOCK_ORGANIZATIONS = [
  {
    id: 1,
    name: "Acme Robotics",
    industry: "Manufacturing",
    plan: "Enterprise",
    users: 42,
    monthlyRequests: 12500,
    storageUsed: "1.2 TB",
    budget: 5000,
    spent: 3240.50,
  },
  {
    id: 2,
    name: "Nova Health",
    industry: "Healthcare",
    plan: "Professional",
    users: 12,
    monthlyRequests: 3400,
    storageUsed: "450 GB",
    budget: 2000,
    spent: 890.20,
  },
];

export const MOCK_PROVIDERS = [
  { id: "openai", name: "OpenAI", models: ["GPT-4o", "DALL-E 3"], status: "operational", latency: "1.2s", costPer1k: "$0.01" },
  { id: "claude", name: "Anthropic Claude", models: ["Claude 3.5 Sonnet", "Claude 3 Opus"], status: "operational", latency: "0.8s", costPer1k: "$0.015" },
  { id: "gemini", name: "Google Gemini", models: ["Gemini 1.5 Pro", "Gemini Flash"], status: "operational", latency: "1.5s", costPer1k: "$0.008" },
  { id: "flux", name: "Flux.1", models: ["Flux Schnell", "Flux Pro"], status: "operational", latency: "2.5s", costPer1k: "$0.02" },
];

export const MOCK_JOBS: (Job & { candidates?: (Candidate & { scores?: Score })[] })[] = [
  {
    id: 101,
    userId: 1,
    prompt: "A futuristic cityscape with flying cars and neon lights, high resolution, cinematic lighting",
    status: "complete",
    winnerId: 401,
    consensusScore: 94,
    b2JobPath: "jobs/101/manifest.json",
    manifestHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    createdAt: new Date(Date.now() - 3600000 * 2),
    updatedAt: new Date(Date.now() - 3600000 * 2),
    candidates: [
      {
        id: 401,
        jobId: 101,
        model: "openai",
        imageUrl: "/mock/sample-1.svg",
        createdAt: new Date(Date.now() - 3600000 * 2),
        scores: { id: 501, candidateId: 401, promptAdherence: 95, visualQuality: 92, robustness: 90, diversity: 88, consensusScore: 94, createdAt: new Date() }
      },
      {
        id: 402,
        jobId: 101,
        model: "gemini",
        imageUrl: "/mock/sample-2.svg",
        createdAt: new Date(Date.now() - 3600000 * 2),
        scores: { id: 502, candidateId: 402, promptAdherence: 88, visualQuality: 85, robustness: 82, diversity: 80, consensusScore: 86, createdAt: new Date() }
      }
    ]
  },
  {
    id: 102,
    userId: 1,
    prompt: "Minimalist logo for a biotech startup, clean lines, professional, green and white",
    status: "complete",
    winnerId: 403,
    consensusScore: 88,
    b2JobPath: "jobs/102/manifest.json",
    manifestHash: "sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    createdAt: new Date(Date.now() - 3600000 * 24),
    updatedAt: new Date(Date.now() - 3600000 * 24),
    candidates: [
      {
        id: 403,
        jobId: 102,
        model: "claude",
        imageUrl: "/mock/sample-3.svg",
        createdAt: new Date(Date.now() - 3600000 * 24),
        scores: { id: 503, candidateId: 403, promptAdherence: 90, visualQuality: 88, robustness: 85, diversity: 82, consensusScore: 88, createdAt: new Date() }
      }
    ]
  }
];

export const MOCK_ANALYTICS = {
  requestsOverTime: [
    { date: "2024-07-26", count: 450 },
    { date: "2024-07-27", count: 520 },
    { date: "2024-07-28", count: 480 },
    { date: "2024-07-29", count: 610 },
    { date: "2024-07-30", count: 590 },
    { date: "2024-07-31", count: 720 },
    { date: "2024-08-01", count: 680 },
  ],
  providerDistribution: [
    { name: "OpenAI", value: 35 },
    { name: "Anthropic", value: 25 },
    { name: "Google", value: 20 },
    { name: "Flux", value: 15 },
    { name: "Others", value: 5 },
  ],
  stats: {
    totalRequests: 12840,
    successRate: 99.4,
    avgLatency: "1.1s",
    costSavings: "$4,250",
  }
};

export const MOCK_ACTIVITY = [
  { id: 1, type: "generation", user: "Alex Rivera", action: "generated new asset", target: "Futuristic Cityscape", timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: 2, type: "storage", user: "System", action: "archived manifest to B2", target: "Job #101", timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 3, type: "security", user: "Sarah Chen", action: "updated API permissions", target: "Nova Health", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3) },
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: "success", title: "Generation Complete", message: "Your asset 'Futuristic Cityscape' is ready.", timestamp: new Date() },
  { id: 2, type: "info", title: "System Update", message: "VeriGen v2.4.0 has been deployed.", timestamp: new Date(Date.now() - 86400000) },
];

export const MOCK_AUDIT_LOGS = [
  { id: "audit-1", event: "job.created", actor: "user-1", target: "job-101", timestamp: new Date(), status: "success", ip: "192.168.1.1" },
  { id: "audit-2", event: "b2.upload", actor: "system", target: "manifest-101.json", timestamp: new Date(), status: "success", hash: "e3b0c442..." },
];
