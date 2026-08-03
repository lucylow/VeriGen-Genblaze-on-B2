
import { MockCandidate } from "../mockMediaProvider";

export interface MockJob {
  id: number;
  userId: number;
  prompt: string;
  status: "pending" | "generating" | "scoring" | "storage" | "complete" | "failed";
  winnerId?: number;
  winnerImageUrl?: string;
  consensusScore?: number;
  b2JobPath?: string;
  manifestHash?: string;
  createdAt: Date;
  candidates: MockCandidateWithId[];
}

export interface MockCandidateWithId extends MockCandidate {
  id: number;
  jobId: number;
}

export interface MockUser {
  id: number;
  openId: string;
  name: string;
  email: string;
  loginMethod: string;
  lastSignedIn: Date;
}

const jobs: MockJob[] = [];
let nextJobId = 1;
let nextCandidateId = 1;

export const mockUser: MockUser = {
  id: 1,
  openId: "demo-user",
  name: "Demo User",
  email: "demo@example.com",
  loginMethod: "demo",
  lastSignedIn: new Date(),
};

export async function createMockJob(userId: number, prompt: string) {
  const job: MockJob = {
    id: nextJobId++,
    userId,
    prompt,
    status: "pending",
    createdAt: new Date(),
    candidates: [],
  };
  jobs.push(job);
  return job;
}

export async function getMockJob(jobId: number) {
  return jobs.find((j) => j.id === jobId) || null;
}

export async function getMockJobHistory(userId: number) {
  return jobs
    .filter((j) => j.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function updateMockJobStatus(
  jobId: number,
  status: MockJob["status"],
  updates?: Partial<Omit<MockJob, "id" | "userId" | "prompt" | "createdAt" | "candidates">>
) {
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    job.status = status;
    if (updates) {
      Object.assign(job, updates);
    }
  }
}

export async function addMockCandidate(
  jobId: number,
  candidate: MockCandidate
) {
  const job = jobs.find((j) => j.id === jobId);
  if (job) {
    const newCandidate: MockCandidateWithId = {
      ...candidate,
      id: nextCandidateId++,
      jobId,
    };
    job.candidates.push(newCandidate);
    return newCandidate;
  }
  return null;
}
