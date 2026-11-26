import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// strictPort: لو 5173 مشغول يفشل بدل ما يتحول لـ 5174، لأن الباك مسموح له 5173 بس (CORS)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
});
