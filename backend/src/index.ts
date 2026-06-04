import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from the local .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });


import authRouter from "./routes/auth";
import devoteesRouter from "./routes/devotees";
import bookingsRouter from "./routes/bookings";
import roomsRouter from "./routes/rooms";
import donationsRouter from "./routes/donations";
import accountsRouter from "./routes/accounts";
import communicationRouter from "./routes/communication";
import contentRouter from "./routes/content";
import settingsRouter from "./routes/settings";
import reportsRouter from "./routes/reports";
import dashboardRouter from "./routes/dashboard";

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for cookies/credentials
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Mount the API routers
app.use("/api/auth", authRouter);
app.use("/api/devotees", devoteesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/donations", donationsRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/communication", communicationRouter);
app.use("/api/content", contentRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/dashboard", dashboardRouter);

// Serve the receipts directly from donations generator route
app.use("/receipts", donationsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] Temple CRM Express API running on http://localhost:${PORT}`);
});
