#!/usr/bin/env node
// Cloudflare Workers disallows dynamic WebAssembly compilation from raw bytes
// at runtime (`new WebAssembly.Module(bytes)`), which is exactly how Prisma's
// generated client loads its query-compiler WASM (decode a base64 string,
// then `new WebAssembly.Module(...)` -- see the generated
// `src/generated/prisma/internal/class.ts`). The fix (applied post-build by
// scripts/postbuild-cloudflare-patches.mjs) imports a real `.wasm` file
// instead, since Wrangler's bundler compiles `.wasm` imports at build time.
//
// Prisma only ships that WASM payload pre-encoded as a base64 JS string
// (query_compiler_fast_bg.postgresql.wasm-base64.js) -- there is no real
// `.wasm` file in the package. This script decodes it once into a real
// binary file so the build-time import has something to point at. Runs from
// `postinstall`, since node_modules is not committed and this file needs to
// exist before every build.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const base64ModulePath = require.resolve("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.js");
const wasmOutputPath = path.join(path.dirname(base64ModulePath), "query_compiler_fast_bg.postgresql.wasm");

if (existsSync(wasmOutputPath)) {
  console.log("[materialize-prisma-wasm] already exists, skipping:", wasmOutputPath);
  process.exit(0);
}

const { wasm } = await import(base64ModulePath);
const bytes = Buffer.from(wasm, "base64");
writeFileSync(wasmOutputPath, bytes);
console.log(`[materialize-prisma-wasm] wrote ${bytes.length} bytes to ${wasmOutputPath}`);
