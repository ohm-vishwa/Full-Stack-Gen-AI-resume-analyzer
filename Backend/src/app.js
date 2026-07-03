const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* test route */
app.use("/", (req, res) => {
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
