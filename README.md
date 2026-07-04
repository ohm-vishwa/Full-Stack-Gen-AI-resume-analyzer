# Full-Stack Gen AI Resume Analyzer

A full-stack resume and interview report generation app powered by AI. This project provides a user-friendly interface for uploading resumes or entering self-descriptions, then uses generative AI to analyze the candidate profile against a job description and create a tailored interview report.

## Live Demo

- https://resume-analyzer01-6lui.onrender.com

## Features

- Upload a resume PDF or provide a quick self-description
- Submit a job description to generate a custom interview report
- AI-generated match score, technical and behavioral questions, skill gaps, and preparation plan
- Download a tailored resume PDF based on the generated report
- User authentication and saved interview reports

## Stack

- Frontend: React, Vite, SCSS
- Backend: Node.js, Express, Mongoose, MongoDB
- AI: Google GenAI via the `@google/genai` package

## Project Structure

- `Backend/` - Express API, Mongoose models, AI service integration, controllers, and middleware
- `Frontend/` - React application, feature-based interview and auth modules

## Deployment

- Live deployment hosted on Render

## Getting Started

1. Clone the repository
2. Install dependencies:
   - `cd Backend && npm install`
   - `cd ../Frontend && npm install`
3. Set backend environment variables, including AI API keys and database URI
4. Run the backend locally:
   - `cd Backend`
   - `npm run dev`
5. Run the frontend locally:
   - `cd Frontend`
   - `npm run dev`

> The backend starts with `npx nodemon server.js`, and the frontend runs with Vite using `npm run dev`.
