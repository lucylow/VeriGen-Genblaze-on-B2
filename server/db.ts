import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, jobs, candidates, scores } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// VeriGen-specific queries
export async function createJob(userId: number, prompt: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(jobs).values({
    userId,
    prompt,
    status: "pending",
  });

  return { id: (result as any).insertId };
}

export async function getJobHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .orderBy(desc(jobs.createdAt));
}

export async function getJobWithCandidates(jobId: number) {
  const db = await getDb();
  if (!db) return null;

  const jobResult = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
  if (!jobResult.length) return null;

  const candidateList = await db.select().from(candidates).where(eq(candidates.jobId, jobId));
  const candidatesWithScores = await Promise.all(
    candidateList.map(async (c) => {
      const scoreList = await db.select().from(scores).where(eq(scores.candidateId, c.id)).limit(1);
      return { ...c, scores: scoreList[0] || null };
    })
  );

  return { ...jobResult[0], candidates: candidatesWithScores };
}

export async function updateJobStatus(
  jobId: number,
  status: string,
  updates?: { winnerId?: number; consensusScore?: number; b2JobPath?: string; manifestHash?: string }
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(jobs)
    .set({
      status: status as any,
      ...updates,
    })
    .where(eq(jobs.id, jobId));
}

export async function addCandidate(
  jobId: number,
  model: string,
  imageUrl: string,
  b2Key?: string
) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(candidates).values({
      jobId: jobId,
      model: model,
      imageUrl: imageUrl,
      b2Key: b2Key || null,
    });

    return { id: (result as any).insertId };
  } catch (error) {
    console.error("[Database] Failed to add candidate:", error);
    throw error;
  }
}

export async function addScore(
  candidateId: number,
  scoreData: {
    promptAdherence: number;
    visualQuality: number;
    robustness: number;
    diversity: number;
    consensusScore: number;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(scores).values({
    candidateId,
    ...scoreData,
  });

  return { id: (result as any).insertId };
}
