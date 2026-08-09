import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes"; // add this import

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());


// ...after app.use(mongoSanitize());
app.use("/auth", authRoutes); // add this line

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.get("/signup", (_req, res) => res.json({ status: "hellooooooo" }));

export default app;