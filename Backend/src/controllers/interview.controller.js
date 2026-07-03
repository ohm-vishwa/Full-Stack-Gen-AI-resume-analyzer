const pdfParse = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");
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

async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan",
      );

    res.status(200).json({
      message: "Interview reports fetched successfully.",
      interviewReports,
    });
  } catch (error) {
    console.error("Error in getAllInterviewReportsController:", error);
    res.status(500).json({
      error: "Failed to fetch interview reports",
      details: error.message,
    });
  }
}

async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findById(interviewId);

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    if (String(interviewReport.user) !== String(req.user.id || req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.status(200).json({
      message: "Interview report fetched successfully.",
      interviewReport,
    });
  } catch (error) {
    console.error("Error in getInterviewReportByIdController:", error);
    res.status(500).json({
      error: "Failed to fetch interview report",
      details: error.message,
    });
  }
}

async function generateResumePdfController(req, res) {
  try {
    const interviewReportId =
      req.params.interviewReportId || req.body.interviewReportId;

    if (!interviewReportId) {
      return res
        .status(400)
        .json({ message: "interviewReportId is required." });
    }

    const interviewReport =
      await interviewReportModel.findById(interviewReportId);

    if (!interviewReport) {
      return res.status(404).json({ message: "Interview report not found." });
    }

    if (String(interviewReport.user) !== String(req.user.id || req.user._id)) {
      return res.status(403).json({ message: "Access denied." });
    }

    const pdfBuffer = await generateResumePdf({
      resume: interviewReport.resume,
      selfDescription: interviewReport.selfDescription,
      jobDescription: interviewReport.jobDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Error in generateResumePdfController:", error);
    return res.status(500).json({
      error: "Failed to generate resume PDF",
      details: error.message,
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getAllInterviewReportsController,
  getInterviewReportByIdController,
  generateResumePdfController,
};
