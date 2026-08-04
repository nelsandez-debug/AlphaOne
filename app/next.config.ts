import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's file tracer (@vercel/nft) can't statically follow pg's runtime-gated
  // `require("pg-cloudflare")` (behind an isCloudflareRuntime() check in
  // pg/lib/stream.js), so it only copies pg-cloudflare's default (non-workerd)
  // dist/empty.js into OpenNext's output -- never the workerd-conditioned
  // dist/index.js that actually contains CloudflareSocket/cloudflare:sockets
  // support. At runtime pg then falls back to a plain Node net connection to
  // the Hyperdrive binding's <hash>.hyperdrive.local target, which isn't a
  // real hostname, producing "proxy request failed, cannot connect to the
  // specified address". Forcing the tracer to include the workerd files here
  // makes them available to OpenNext's later esbuild pass, which does follow
  // the workerd condition. Root-caused by Cloudflare support (case #02263865);
  // same underlying tracer gap as opennextjs-cloudflare#1214/#1322.
  outputFileTracingIncludes: {
    "**/*": ["./node_modules/pg-cloudflare/dist/**", "./node_modules/pg-cloudflare/esm/**"],
  },
};

export default nextConfig;
