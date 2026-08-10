"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dns_1 = __importDefault(require("node:dns"));
node_dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const PORT = process.env.PORT || 4000;
(0, db_1.connectDB)()
    .then(() => {
    app_1.default.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
})
    .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
});
