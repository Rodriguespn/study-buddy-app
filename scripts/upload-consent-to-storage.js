/**
 * Script to upload consent.html to Supabase Storage
 *
 * Prerequisites:
 * 1. Create a public bucket named "oauth" in Supabase Dashboard
 *    - Go to Storage > New bucket
 *    - Name: oauth
 *    - Public bucket: YES
 *
 * 2. Set environment variables:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY (not anon key - needs admin access)
 *
 * Usage:
 *   node scripts/upload-consent-to-storage.js
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing environment variables:");
  console.error("   SUPABASE_URL:", SUPABASE_URL ? "✓" : "✗");
  console.error("   SUPABASE_SERVICE_ROLE_KEY:", SUPABASE_SERVICE_ROLE_KEY ? "✓" : "✗");
  console.error("\nSet them before running this script:");
  console.error("  export SUPABASE_URL=https://your-project.supabase.co");
  console.error("  export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const BUCKET_NAME = "oauth";
const FILE_PATH = path.join(__dirname, "../supabase/storage/oauth/consent.html");

async function main() {
  console.log("🚀 Uploading consent.html to Supabase Storage...\n");

  // Check if file exists
  if (!fs.existsSync(FILE_PATH)) {
    console.error(`❌ File not found: ${FILE_PATH}`);
    process.exit(1);
  }

  // Read file
  const fileContent = fs.readFileSync(FILE_PATH);
  console.log(`📄 Read file: ${FILE_PATH} (${fileContent.length} bytes)`);

  // Check if bucket exists, create if not
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("❌ Error listing buckets:", listError.message);
    process.exit(1);
  }

  const bucketExists = buckets.some((b) => b.name === BUCKET_NAME);
  if (!bucketExists) {
    console.log(`📦 Creating public bucket: ${BUCKET_NAME}`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB limit for HTML files
      allowedMimeTypes: ["text/html"],
    });
    if (createError) {
      console.error("❌ Error creating bucket:", createError.message);
      process.exit(1);
    }
    console.log(`✅ Bucket created: ${BUCKET_NAME}`);
  } else {
    console.log(`📦 Bucket exists: ${BUCKET_NAME}`);
  }

  // Upload file (upsert to overwrite if exists)
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload("consent.html", fileContent, {
      contentType: "text/html",
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("❌ Error uploading file:", error.message);
    process.exit(1);
  }

  console.log(`✅ File uploaded: ${data.path}`);

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl("consent.html");

  console.log("\n📋 Public URL:");
  console.log(`   ${urlData.publicUrl}`);

  console.log("\n🔧 Configure this URL in Supabase Dashboard:");
  console.log("   Authentication > OAuth Server > Authorization Path");
  console.log(`   Set to: ${urlData.publicUrl}`);

  console.log("\n✅ Done!");
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
