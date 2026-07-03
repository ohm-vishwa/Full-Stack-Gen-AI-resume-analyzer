const test = require("node:test");
const assert = require("node:assert/strict");

const { normalizeInterviewReport } = require("../src/services/ai.service");

test("normalizeInterviewReport uses job description when title is missing", () => {
  const result = normalizeInterviewReport(
    {
      matchScore: 82,
      technicalQuestions: [],
      behavioralQuestions: [],
      skillGaps: [],
      preparationPlan: [],
    },
    "Senior Backend Engineer",
  );

  assert.equal(result.title, "Senior Backend Engineer");
  assert.equal(result.matchScore, 82);
  assert.deepEqual(result.technicalQuestions, []);
});

test("normalizeInterviewReport preserves an existing title", () => {
  const result = normalizeInterviewReport(
    {
      title: "Lead Full Stack Engineer",
      technicalQuestions: [],
      behavioralQuestions: [],
      skillGaps: [],
      preparationPlan: [],
    },
    "Senior Backend Engineer",
  );

  assert.equal(result.title, "Lead Full Stack Engineer");
});
