const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser());
// In your BACKEND code (e.g., server.js)
const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://resume-analyzer01-6lui.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS configuration"));
      }
    },
    credentials: true,
  }),
);

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* test route */
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    status: "ok",
    timestamp: new Date(),
  });
});

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
