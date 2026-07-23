/**
 * Plesk startup file — auto-build si dist/ est absent
 */
import { existsSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distEntry = path.join(__dirname, "dist", "index.js");

if (!existsSync(distEntry)) {
  console.log(">>> dist/index.js introuvable — build en cours...");
  try {
    execSync("npm install --include=dev", { stdio: "inherit", cwd: __dirname });
    execSync("npm run build",            { stdio: "inherit", cwd: __dirname });
    console.log(">>> Build terminé ✅");
  } catch (err) {
    console.error(">>> ERREUR de build :", err.message);
    process.exit(1);
  }
}

// Lance le serveur buildé
await import(pathToFileURL(distEntry).href);
