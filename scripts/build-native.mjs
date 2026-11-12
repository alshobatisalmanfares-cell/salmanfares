import { execFileSync } from "node:child_process";

const stages = [
  ["Prepare catalog and images", ["scripts/prepare-native.mjs"]],
  ["Bundle and prerender local shell", ["node_modules/vite/bin/vite.js", "build"]],
  ["Finalize offline package", ["scripts/finalize-native.mjs"]],
];
for (const [label, args] of stages) {
  console.log(`[native] Starting: ${label}`);
  try {
    execFileSync(process.execPath, ["--unhandled-rejections=strict", ...args], {
      stdio: "inherit", env: { ...process.env, VITE_NATIVE_APP: "true" },
    });
  } catch (error) {
    console.error(`[native] Failed: ${label} (exit ${error.status ?? "unknown"}). See the original error above.`);
    process.exit(error.status || 1);
  }
}
console.log("[native] Offline app completed successfully.");