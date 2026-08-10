import "dotenv/config";
import { connectDB } from "../config/db";
import { User } from "../models/User";

async function seedAdmin() {
  const phone = process.env.ADMIN_PHONE;
  const name = process.env.ADMIN_NAME || "Admin";

  if (!phone) {
    console.error("ADMIN_PHONE is not set in .env");
    process.exit(1);
  }

  await connectDB();

  const user = await User.findOneAndUpdate(
    { phone },
    { phone, name, role: "ADMIN", verified: true },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin ready: ${user.name} (${user.phone}) role=${user.role} verified=${user.verified}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
