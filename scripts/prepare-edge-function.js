#!/usr/bin/env node

/**
 * Prepare Edge Function Script
 *
 * This script prepares the Supabase Edge Function by:
 * 1. Building the shared and web packages
 * 2. Copying shared types to the edge function
 * 3. Copying web dist to the edge function widgets directory
 * 4. Copying OAuth consent page to the edge function
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const EDGE_FN = path.join(ROOT, "supabase/functions/study-buddy");

function run(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { cwd: ROOT, stdio: "inherit" });
  } catch (error) {
    console.error(`❌ Failed: ${description}`);
    process.exit(1);
  }
}

function copyFile(src, dest, description) {
  console.log(`📄 ${description}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest, description) {
  console.log(`📁 ${description}`);
  fs.cpSync(src, dest, { recursive: true });
}

function writeFile(dest, content, description) {
  console.log(`📝 ${description}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

console.log("🚀 Preparing Supabase Edge Function...\n");

// Step 1: Build packages
run("pnpm --filter @study-buddy/shared build", "Building shared package");
run("pnpm --filter @study-buddy/web build", "Building web package");

// Step 2: Copy shared types (with Deno-compatible imports)
console.log("\n📦 Copying shared types...");

// Copy types.ts as-is (no npm imports)
const typesContent = fs.readFileSync(
  path.join(ROOT, "shared/src/types.ts"),
  "utf8"
);
writeFile(
  path.join(EDGE_FN, "src/shared/types.ts"),
  typesContent,
  "Copying types.ts"
);

// Copy schemas.ts with Deno-compatible imports and re-export constants
let schemasContent = fs.readFileSync(
  path.join(ROOT, "shared/src/schemas.ts"),
  "utf8"
);
// Update imports for Deno
schemasContent = schemasContent.replace(/from "zod"/g, 'from "zod"');
schemasContent = schemasContent.replace(/\.\/types\.js/g, "./types.ts");
// Add re-exports of constants from types.ts so server.ts can import from one place
schemasContent += `
// Re-export constants from types for convenience
export { CATEGORIES, DIFFICULTIES, LANGUAGES } from "./types.ts";
`;
writeFile(
  path.join(EDGE_FN, "src/shared/schemas.ts"),
  schemasContent,
  "Copying schemas.ts (with Deno imports and re-exports)"
);

// Step 3: Copy web dist to widgets directory
const webDistPath = path.join(ROOT, "web/dist");
const widgetsPath = path.join(EDGE_FN, "widgets");

if (fs.existsSync(webDistPath)) {
  // Clean existing widgets directory
  if (fs.existsSync(widgetsPath)) {
    fs.rmSync(widgetsPath, { recursive: true });
  }
  copyDir(webDistPath, widgetsPath, "Copying web build to widgets/");
} else {
  console.warn("⚠️  Warning: web/dist not found. Run 'pnpm --filter @study-buddy/web build' first.");
}

// Step 4: Copy OAuth consent page
const consentSrcPath = path.join(ROOT, "server/public/oauth/consent.html");
const consentDestPath = path.join(EDGE_FN, "public/oauth/consent.html");

if (fs.existsSync(consentSrcPath)) {
  copyFile(consentSrcPath, consentDestPath, "Copying OAuth consent page");
} else {
  console.warn("⚠️  Warning: OAuth consent page not found at server/public/oauth/consent.html");
}

console.log("\n✅ Edge function prepared successfully!");
console.log("\nNext steps:");
console.log("  • Local development: pnpm edge:dev");
console.log("  • Deploy: pnpm edge:deploy");
