// server/app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import requireLogin from "../middleware/requireLogin.js";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import preventAuthForLoggedIn from "../middleware/preventAuthForLoggedIn.js";
import { sequelize } from "../models/postgres/sequelize.js";
// Import route modules
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import driveRoutes from "./routes/manageDrives.js";
import imageRoutes from "./routes/imageSearch.js";
import imageHandlerRoutes from "./routes/images.js";

await sequelize.sync();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

// --- Redis Session Store Setup ---

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

app.use(
    session({
        store: redisStore,
        secret: process.env.SESSION_SECRET || "supersecret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 7,
        },
    })
);

// ---------- Middleware Setup ----------
app.use(
    helmet({
        contentSecurityPolicy: false, // temporarily disabled if loading inline scripts
    })
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));



// ---------- Public (Pre-login) Routes ----------


app.get("/", preventAuthForLoggedIn, (req, res) => {
    return res.redirect("/index");
});

app.get("/index", preventAuthForLoggedIn, (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/register", preventAuthForLoggedIn, (req, res) => {
    return res.sendFile(path.join(__dirname, "public", "register.html"));
});

app.use("/auth", authRoutes);

//----------Protected(Post - login) Routes----------
app.use("/dashboard", requireLogin, dashboardRoutes);
app.use("/manageDrives", requireLogin, driveRoutes);
app.use("/imageSearch", requireLogin, imageRoutes);
app.use("/images", requireLogin, imageHandlerRoutes);

// ---------- Serve Static Files ----------
app.use(express.static(path.join(__dirname, "public")));

// ---------- Start Server ----------
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
