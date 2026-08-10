"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../config/db");
const User_1 = require("../models/User");
async function seedAdmin() {
    const phone = process.env.ADMIN_PHONE;
    const name = process.env.ADMIN_NAME || "Admin";
    if (!phone) {
        console.error("ADMIN_PHONE is not set in .env");
        process.exit(1);
    }
    await (0, db_1.connectDB)();
    const user = await User_1.User.findOneAndUpdate({ phone }, { phone, name, role: "ADMIN", verified: true }, { upsert: true, new: true, setDefaultsOnInsert: true });
    console.log(`Admin ready: ${user.name} (${user.phone}) role=${user.role} verified=${user.verified}`);
    process.exit(0);
}
seedAdmin().catch((err) => {
    console.error(err);
    process.exit(1);
});
