import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
import listingRoutes from "./routes/listing.routes";
import adminRoutes from "./routes/admin.routes";
import projectRoutes from "./routes/project.routes";
import inquiryRoutes from "./routes/inquiry.routes";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/listings", listingRoutes);
app.use("/projects", projectRoutes);
app.use("/inquiries", inquiryRoutes);
app.use("/me", userRoutes);
app.use("/admin", adminRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use(errorHandler);

export default app;
