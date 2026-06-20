// Keeps the Next.js dev server alive by respawning it if it dies.
import { spawn } from "bun";

function startDev() {
  console.log("[dev-keeper] Starting Next.js dev server...");
  const proc = spawn({
    cmd: ["node", "/home/z/my-project/node_modules/.bin/next", "dev", "-p", "3000"],
    cwd: "/home/z/my-project",
    stdout: "inherit",
    stderr: "inherit",
  });
  proc.exited.then((code) => {
    console.log(`[dev-keeper] Next.js exited with code ${code}, restarting in 2s...`);
    setTimeout(startDev, 2000);
  });
  return proc;
}

startDev();
