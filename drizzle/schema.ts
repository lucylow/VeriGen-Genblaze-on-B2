import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jobs = mysqlTable("jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  winnerId: int("winnerId"),
  consensusScore: int("consensusScore"), // 0-100
  b2JobPath: varchar("b2JobPath", { length: 512 }),
  manifestHash: varchar("manifestHash", { length: 64 }), // SHA-256
  status: mysqlEnum("status", ["pending", "generating", "scoring", "storage", "complete", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const candidates = mysqlTable("candidates", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull(),
  model: varchar("model", { length: 128 }).notNull(), // openai, gemini, replicate, gmi
  imageUrl: text("imageUrl"),
  b2Key: varchar("b2Key", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  candidateId: int("candidateId").notNull(),
  promptAdherence: int("promptAdherence"), // 0-100
  visualQuality: int("visualQuality"), // 0-100
  robustness: int("robustness"), // 0-100
  diversity: int("diversity"), // 0-100
  consensusScore: int("consensusScore"), // weighted: 0.4*prompt + 0.25*visual + 0.2*robust + 0.15*diversity
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type InsertCandidate = typeof candidates.$inferInsert;
export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;