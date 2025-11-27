import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import session from "express-session";
import bodyParser from "body-parser";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";

// Middleware
import requireLogin from "./middleware/requireLogin.js";

// Routes
import authRoutes from "./routes/auth.js";
import imageHandlerRoutes from "./routes/images.js";
import googleAuthRoutes from "./routes/googleAuth.js";
import onedriveAuthRoutes from "./routes/onedriveAuth.js";
import dropboxAuthRoutes from "./routes/dropboxAuth.js";

// ============================================================
// 🚀 App Initialization
// ============================================================
const app = express();
const PORT = process.env["PORT"] || 3000;
const isProd = process.env["NODE_ENV"] === "production";
const useTLS = process.env["REDIS_TLS"] === "true";

// ============================================================
// ⚙️ Redis Configuration
// ============================================================
const redisClient = createClient({
    url: process.env["REDIS_URL"] || "redis://localhost:6379",
    socket: useTLS
        ? {
            tls: true,
            rejectUnauthorized: false,
        }
        : {},
});
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
await redisClient.connect();

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("🧹 Closing Redis connection...");
    await redisClient.quit();
    process.exit(0);
});

// ============================================================
// 🧱 Express Middleware
// ============================================================

// Trust Render / reverse proxies for secure cookies
app.set("trust proxy", 1);

// --- CORS ---
app.use(
    cors({
        origin: [
            "https://multisourcesearch.onrender.com",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        credentials: true,
    })
);

// --- Security & Logging ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));

// --- Body Parsing ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Sessions ---
app.use(
    session({
        store: redisStore,
        secret: process.env["SESSION_SECRET"] || "supersecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: isProd,
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

// ============================================================
// 🌐 Routes
// ============================================================

app.use("/api/auth", authRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/auth/onedrive", onedriveAuthRoutes);
app.use("/api/auth/dropbox", dropboxAuthRoutes);
app.use("/api/images", requireLogin, imageHandlerRoutes);

// Example health check route
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", redis: redisClient.isOpen });
});

// ============================================================
// 🏁 Server Startup
// ============================================================
app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
