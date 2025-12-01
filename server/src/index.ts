import path from "node:path";
import { fileURLToPath } from "node:url";

import express, { type Express } from "express";
import { widgetsDevServer } from "skybridge/server";
import type { ViteDevServer } from "vite";
import { env } from "./env.js";
import { mcp } from "./middleware.js";
import server from "./server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express() as Express & { vite: ViteDevServer };

app.use(express.json());

// OAuth 2.1 Protected Resource Metadata (RFC 9728)
// This endpoint tells MCP clients where to find the authorization server
// CORS enabled for all origins since this is a public discovery mechanism
app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.json({
    resource: env.MCP_SERVER_URL,
    authorization_servers: [`${env.SUPABASE_URL}/auth/v1`],
    // Note: Removed "openid" scope to avoid ID token generation errors in Supabase beta
    // If ID token generation is fixed, add "openid" back for full OIDC support
    scopes_supported: ["email", "profile"],
  });
});

// Handle CORS preflight for protected resource metadata
app.options("/.well-known/oauth-protected-resource", (_req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.sendStatus(204);
});

// OAuth consent UI configuration (returns public Supabase config)
app.get("/oauth/config.json", (_req, res) => {
  res.json({
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
  });
});

// Serve OAuth consent UI
app.get("/assets/oauth/consent", (_req, res) => {
  res.sendFile(path.join(__dirname, "../assets/oauth/consent.html"));
});

// Serve static files for OAuth (e.g., config.json if moved here later)
app.use("/assets/oauth", express.static(path.join(__dirname, "../assets/oauth")));

app.use(mcp(server));

if (env.NODE_ENV !== "production") {
  app.use(await widgetsDevServer());
}

app.listen(3000, (error) => {
  if (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }

  console.log(`Server listening on port 3000 - ${env.NODE_ENV}`);
  console.log(
    "Make your local server accessible with 'ngrok http 3000' and connect to ChatGPT with URL https://xxxxxx.ngrok-free.app/mcp"
  );
});

process.on("SIGINT", async () => {
  console.log("Server shutdown complete");
  process.exit(0);
});
