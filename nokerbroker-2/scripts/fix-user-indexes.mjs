import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing from .env.local.");
  process.exit(1);
}

const atlasDirectHosts = [
  "ac-qwxti4l-shard-00-00.pbpdvml.mongodb.net",
  "ac-qwxti4l-shard-00-01.pbpdvml.mongodb.net",
  "ac-qwxti4l-shard-00-02.pbpdvml.mongodb.net",
];

function directAtlasUri(uri) {
  if (process.env.MONGODB_DIRECT_URI) return process.env.MONGODB_DIRECT_URI;
  if (!uri.startsWith("mongodb+srv://cluster0.pbpdvml.mongodb.net") && !uri.includes("@cluster0.pbpdvml.mongodb.net")) return null;
  const parsed = new URL(uri);
  const params = new URLSearchParams(parsed.search);
  params.set("authSource", "admin");
  params.set("replicaSet", "atlas-aicbwc-shard-0");
  params.set("tls", "true");
  return `mongodb://${parsed.username}:${parsed.password}@${atlasDirectHosts.join(",")}${parsed.pathname}?${params}`;
}

try {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    const fallbackUri = error instanceof Error && error.message.includes("querySrv ECONNREFUSED")
      ? directAtlasUri(process.env.MONGODB_URI)
      : null;
    if (!fallbackUri) throw error;
    await mongoose.connect(fallbackUri);
  }
  const users = mongoose.connection.collection("users");
  const indexes = await users.indexes();
  const whatsappIndex = indexes.find((index) => index.name === "whatsappNumber_1");

  if (whatsappIndex) {
    await users.dropIndex("whatsappNumber_1");
    console.log("Removed the existing whatsappNumber index.");
  }
  await users.createIndex({ whatsappNumber: 1 }, { unique: true, sparse: true, name: "whatsappNumber_1" });
  console.log("Created a unique sparse whatsappNumber index. Google accounts may now omit WhatsApp numbers.");
} catch (error) {
  console.error("Could not repair the users indexes:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
