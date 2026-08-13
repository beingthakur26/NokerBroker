// lib/mongodb.ts
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import mongoose from "mongoose";

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";
const ATLAS_DIRECT_HOSTS = [
  "ac-qwxti4l-shard-00-00.pbpdvml.mongodb.net",
  "ac-qwxti4l-shard-00-01.pbpdvml.mongodb.net",
  "ac-qwxti4l-shard-00-02.pbpdvml.mongodb.net",
];

function directAtlasUri(uri: string): string | null {
  if (process.env.MONGODB_DIRECT_URI) return process.env.MONGODB_DIRECT_URI;
  if (!uri.startsWith("mongodb+srv://cluster0.pbpdvml.mongodb.net") && !uri.includes("@cluster0.pbpdvml.mongodb.net")) return null;
  const parsed = new URL(uri);
  const params = new URLSearchParams(parsed.search);
  params.set("authSource", "admin");
  params.set("replicaSet", "atlas-aicbwc-shard-0");
  params.set("tls", "true");
  return `mongodb://${parsed.username}:${parsed.password}@${ATLAS_DIRECT_HOSTS.join(",")}${parsed.pathname}?${params}`;
}

function isSrvRefused(error: unknown): boolean {
  return error instanceof Error && (error.message.includes("querySrv ECONNREFUSED") || error.message.includes("queryA ECONNREFUSED"));
}

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache = globalWithMongoose.mongoose ?? {
  conn: null,
  promise: null,
};
globalWithMongoose.mongoose = cached;

async function dbConnect(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment variables.");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 10000 })
      .catch(async (error: unknown) => {
        const fallbackUri = isSrvRefused(error) ? directAtlasUri(MONGODB_URI) : null;
        if (!fallbackUri) throw error;
        return mongoose.connect(fallbackUri, { bufferCommands: false, serverSelectionTimeoutMS: 10000 });
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Clear cached promise on failure so next request retries
    throw error;
  }

  return cached.conn;
}

export default dbConnect;
