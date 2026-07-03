import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/",
  server: {
    host: "0.0.0.0",
    allowedHosts: [
      "resume-analyzer-zcke.onrender.com",
      "full-stack-gen-ai-resume-frontend.onrender.com",
      "full-stack-gen-ai-resume-analyzer.onrender.com",
    ],
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    allowedHosts: [
      "resume-analyzer-zcke.onrender.com",
      "full-stack-gen-ai-resume-frontend.onrender.com",
      "full-stack-gen-ai-resume-analyzer.onrender.com",
    ],
  },
});
