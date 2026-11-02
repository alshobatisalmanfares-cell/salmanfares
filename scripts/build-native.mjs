import { execFileSync } from "node:child_process";

execFileSync(process.execPath, ["scripts/prepare-native.mjs"], { stdio: "inherit" });
execFileSync(process.execPath, ["node_modules/vite/bin/vite.js", "build"], {
  stdio: "inherit", env: { ...process.env, VITE_NATIVE_APP: "true" },
});
execFileSync(process.execPath, ["scripts/finalize-native.mjs"], { stdio: "inherit" });