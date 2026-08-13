import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: ".env.local" });

const [action, rawEmail] = process.argv.slice(2);
const email = rawEmail?.trim().toLowerCase();

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is missing from .env.local.");
  process.exit(1);
}

if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error("Usage: npm run admin:grant -- person@example.com");
  console.error("       npm run admin:revoke -- person@example.com");
  process.exit(1);
}

if (action !== "grant" && action !== "revoke") {
  console.error("Choose either grant or revoke.");
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGODB_URI);
  const result = await mongoose.connection.collection("users").findOneAndUpdate(
    { email: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    { $set: { role: action === "grant" ? "ADMIN" : "USER" } },
    { returnDocument: "after" }
  );

  if (!result) {
    console.error(`No user exists for ${email}. Have that person sign up first.`);
    process.exitCode = 1;
  } else {
    console.log(`${result.email} is now ${result.role}.`);
    console.log("They must sign out and sign in again for the new role to take effect.");
  }
} catch (error) {
  console.error("Could not update the admin role:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
