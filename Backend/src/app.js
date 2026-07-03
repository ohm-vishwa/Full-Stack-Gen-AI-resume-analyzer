const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, Postman, or server requests)
      if (!origin) return callback(null, true);
      // Echo back the request origin to allow credentials
      return callback(null, origin);
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

/* require all the routes here */
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

/* using all the routes here */
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

/* test route */
app.get("/", (req, res) => {
  res.json({
    message: "Backend API is running",
    status: "ok",
    timestamp: new Date(),
  });
});

module.exports = app;
