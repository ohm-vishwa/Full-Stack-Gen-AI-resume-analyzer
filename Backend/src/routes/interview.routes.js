const express = require("express");
const authMiddleware = require("../middlewares/auth.middileware");
const interviewController = require("../controllers/interview.controller");
const upload = require("../middlewares/file.middleware");

const interviewRouter = express.Router();

/**
 * @route GET /api/interview/
 * @description health check for the interview route
 * @access public
 */
interviewRouter.get("/", (req, res) => {
  res.json({ message: "Interview API is available" });
});

/**
 * @route POST /api/interview/
 * @description generate new interview report on the basis of resume pdf, selfDescription and jobDescription
 * @access private
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

module.exports = interviewRouter;
