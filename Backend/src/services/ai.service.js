// src/services/ai.service.js
const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");
const puppeteer = require("puppeteer");
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEN_API_KEY,
});

// Explicit uppercase types force the Gemini API engine to build precise object structures
const rawInterviewSchema = {
  type: "OBJECT",
  properties: {
    matchScore: {
      type: "INTEGER",
      description:
        "A score between 0 and 100 indicating how well the candidate profile matches the job description",
    },
    title: {
      type: "STRING",
      description: "The title of the targeted job role",
    },
    technicalQuestions: {
      type: "ARRAY",
      description:
        "An array of structured technical question objects. DO NOT return plain strings.",
      items: {
        type: "OBJECT",
        properties: {
          question: {
            type: "STRING",
            description: "The technical question text",
          },
          intention: {
            type: "STRING",
            description: "Why the interviewer is asking this",
          },
          answer: {
            type: "STRING",
            description: "Detailed guide or points to cover in the response",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    behavioralQuestions: {
      type: "ARRAY",
      description:
        "An array of structured behavioral question objects. DO NOT return plain strings.",
      items: {
        type: "OBJECT",
        properties: {
          question: {
            type: "STRING",
            description: "The behavioral situational question text",
          },
          intention: {
            type: "STRING",
            description: "What soft skill or trait is being evaluated",
          },
          answer: {
            type: "STRING",
            description:
              "The best strategy or STAR approach implementation to answer this",
          },
        },
        required: ["question", "intention", "answer"],
      },
    },
    skillGaps: {
      type: "ARRAY",
      description:
        "An array of structured skill gap objects. DO NOT return plain strings.",
      items: {
        type: "OBJECT",
        properties: {
          skill: {
            type: "STRING",
            description: "Name of the missing tool, concept, or library",
          },
          severity: {
            type: "STRING",
            enum: ["low", "medium", "high"],
            description: "The gap severity level",
          },
        },
        required: ["skill", "severity"],
      },
    },
    preparationPlan: {
      type: "ARRAY",
      description:
        "An array of day-wise preparation plan objects. DO NOT return plain strings.",
      items: {
        type: "OBJECT",
        properties: {
          day: {
            type: "INTEGER",
            description: "The timeline day number (e.g., 1, 2, 3)",
          },
          focus: {
            type: "STRING",
            description: "The main focus topic domain area for this day",
          },
          tasks: {
            type: "ARRAY",
            items: { type: "STRING" },
            description:
              "A list of actionable steps or sub-tasks to complete on this day",
          },
        },
        required: ["day", "focus", "tasks"],
      },
    },
  },
  required: [
    "matchScore",
    "title",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
  ],
};

async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const prompt = `You are an expert interview coach. Create a detailed, comprehensive interview preparation report for the candidate based on the parameters provided.

Candidate Profile Details:
Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Strict Requirements:
- Build a full, valid JSON structure matching the schema precisely.
- Ensure every element within 'technicalQuestions', 'behavioralQuestions', 'skillGaps', and 'preparationPlan' is an OBJECT containing all required keys. Never map strings directly into these arrays.`;

  // Switching to the modern stable gemini-2.5-flash ensures perfect structural schema compliance
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: rawInterviewSchema,
    },
  });

  if (!response.text) {
    throw new Error("Empty AI response text");
  }

  return JSON.parse(response.text);
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = z.object({
    html: z
      .string()
      .describe(
        "The HTML content of the resume which can be converted to PDF using any library like puppeteer",
      ),
  });

  const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(resumePdfSchema),
    },
  });

  const jsonContent = JSON.parse(response.text);

  const pdfBuffer = await generatePdfFromHtml(jsonContent.html);

  console.log("hello");

  return pdfBuffer;
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};
