// src/app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import { sequelize } from "../models/postgres/sequelize.js";
import requireLogin from "../middleware/requireLogin.js";
import preventAuthForLoggedIn from "../middleware/preventAuthForLoggedIn.js";

// Import routes
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import driveRoutes from "./routes/manageDrives.js";
import imageRoutes from "./routes/imageSearch.js";
import imageHandlerRoutes from "./routes/images.js";

// ---------- Init ----------
await sequelize.sync();
const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();
const isProd = process.env.NODE_ENV === "production";
// ---------- Redis Setup ----------
const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        tls: process.env.REDIS_URL?.startsWith("rediss://"),
        rejectUnauthorized: false,
    },
});
redisClient.on("error", (err) => console.error("❌ Redis error:", err));
await redisClient.connect();

const redisStore = new RedisStore({
    client: redisClient,
    prefix: "sess:",
});

// ---------- Express Config ----------
app.set("trust proxy", 1); // REQUIRED on Render or any proxy

// --- CORS ---
app.use(cors({
    origin: [
        "https://multisourcesearch.onrender.com", // your production frontend
        "http://localhost:3000", // local dev (optional)
    ],
    credentials: true,
}));

// --- Helmet, logging, body parsing ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- Session Middleware ---
app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET || "supersecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: isProd,          // Render uses HTTPS
            httpOnly: true,
            sameSite: isProd ? "none" : "lax",      // required for cross-site cookies
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })
);

// ---------- Routes ----------

// Public pages
app.get("/", preventAuthForLoggedIn, (req, res) => res.redirect("/index"));
app.get("/index", preventAuthForLoggedIn, (req, res) =>
    res.sendFile(path.join(__dirname, "public", "index.html"))
);
app.get("/register", preventAuthForLoggedIn, (req, res) =>
    res.sendFile(path.join(__dirname, "public", "register.html"))
);
app.use("/auth", authRoutes);

// Protected pages
app.use("/dashboard", requireLogin, dashboardRoutes);
app.use("/manageDrives", requireLogin, driveRoutes);
app.use("/imageSearch", requireLogin, imageRoutes);
app.use("/images", requireLogin, imageHandlerRoutes);

// Static files
app.use(express.static(path.join(__dirname, "public")));

// ---------- Start ----------
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
