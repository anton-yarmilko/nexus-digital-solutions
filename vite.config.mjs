import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import worker from "./worker/index.js";

function contactApi() {
  return {
    name: "nexus-contact-api",
    configureServer(server) {
      server.middlewares.use("/api/contact", async (req, res) => {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const request = new Request(`http://${req.headers.host}/api/contact`, {
          method: req.method,
          headers: req.headers,
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        });
        const response = await worker.fetch(request, {});
        res.statusCode = response.status;
        response.headers.forEach((value, name) => res.setHeader(name, value));
        res.end(Buffer.from(await response.arrayBuffer()));
      });
    },
  };
}

export default defineConfig({
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [contactApi(), react()],
});
