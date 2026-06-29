const pdfParse = require("pdf-parse");
const { generateInterviewReport } = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

async function generateInterviewReportController(req, res) {
  try {
    // Ensure a file was actually uploaded by Multer
    if (!req.file || !req.file.buffer) {
      return res
        .status(400)
        .json({ error: "Please upload a valid PDF resume." });
    }

    // 2. Call it directly as a function argument pass
    const resumeContent = await new pdfParse.PDFParse(
      Uint8Array.from(req.file.buffer),
    ).getText();

    const { selfDescription, jobDescription } = req.body;

    const interviewReportByAi = await generateInterviewReport({
      resume: resumeContent.text,
      selfDescription,
      jobDescription,
    });
    // console.log("ohm.....", interviewReportByAi);

    const aiTitle =
      interviewReportByAi?.title?.trim() ||
      (jobDescription
        ? `Interview Report for ${jobDescription}`
        : "Interview Report");

    const interviewReport = await interviewReportModel.create({
      user: req.user?._id,
      resume: resumeContent.text,
      selfDescription: selfDescription || "",
      jobDescription,

      matchScore: interviewReportByAi.matchScore,
      technicalQuestions: interviewReportByAi.technicalQuestions,
      behavioralQuestions: interviewReportByAi.behavioralQuestions,
      skillGaps: interviewReportByAi.skillGaps,
      preparationPlan: interviewReportByAi.preparationPlan,
      title: aiTitle,
    });

    return res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
      aiResponse: interviewReportByAi,
    });
  } catch (error) {
    console.error("Error in generateInterviewReportController:", error);
    return res.status(500).json({
      error: "Failed to generate interview report",
      details: error.message,
    });
  }
}

module.exports = {
  generateInterviewReportController,
};
