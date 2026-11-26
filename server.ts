import express from "express";
import path from "path";
import fs from "fs";
import app from "./server/app.js";

// Global crash protection for container stability
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception in server:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection in server:", reason);
});

const PORT = Number(process.env.PORT) || 3000;

// Server startup & environment adaptation
async function start() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof __filename !== "undefined" && __filename.endsWith(".cjs")) ||
    !fs.existsSync(path.join(process.cwd(), "src"));

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: false,
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("🛠️ Vite middleware mounted in development mode");
    } catch (viteErr) {
      console.error("Failed to start Vite middleware, falling back to static files:", viteErr);
    }
  } else {
    // Resolve dist path robustly across deployment environments
    const candidatePaths = [
      path.join(process.cwd(), "dist"),
      __dirname,
      path.join(__dirname, "dist"),
      path.join(__dirname, "../dist"),
      path.join(process.cwd(), "applet", "dist"),
    ];
    let distPath = candidatePaths.find(
      (p) => fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))
    );
    if (!distPath) {
      distPath = path.join(process.cwd(), "dist");
    }

    console.log(`📦 Serving production static assets from: ${distPath}`);
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      res.sendFile(indexPath, (err) => {
        if (err && !res.headersSent) {
          res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>ElectroForge</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`);
        }
      });
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ ElectroForge Server active on http://0.0.0.0:${PORT} [mode: ${isProduction ? "production" : "development"}]`);
  });

  server.on("error", (err: any) => {
    console.error("HTTP Server listener error:", err);
  });

  const gracefulShutdown = () => {
    console.log("Received termination signal, shutting down gracefully...");
    server.close(() => {
      console.log("ElectroForge HTTP server successfully closed.");
      process.exit(0);
    });
    setTimeout(() => {
      console.error("Forced termination after shutdown timeout.");
      process.exit(0);
    }, 5000).unref();
  };

  process.on("SIGTERM", gracefulShutdown);
  process.on("SIGINT", gracefulShutdown);
}

start();
