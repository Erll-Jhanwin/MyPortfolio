import { randomBytes, scryptSync } from "node:crypto";

if (!process.stdin.isTTY || !process.stdout.isTTY || typeof process.stdin.setRawMode !== "function") {
  console.error("Run this command in an interactive terminal so the password can be entered without echo.");
  process.exit(1);
}

function readHidden(prompt) {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    let value = "";
    process.stdout.write(prompt);
    input.setRawMode(true);
    input.resume();
    const onData = (buffer) => {
      for (const char of buffer.toString("utf8")) {
        if (char === "\u0003") { input.off("data", onData); input.setRawMode(false); reject(new Error("Cancelled")); return; }
        if (char === "\r" || char === "\n") { input.off("data", onData); input.setRawMode(false); input.pause(); process.stdout.write("\n"); resolve(value); return; }
        if (char === "\u007f" || char === "\b") { value = value.slice(0, -1); continue; }
        if (char >= " ") value += char;
      }
    };
    input.on("data", onData);
  });
}

try {
  const first = await readHidden("New admin password (12+ characters): ");
  const second = await readHidden("Confirm password: ");
  if (first.length < 12 || first.length > 1024 || first !== second) throw new Error("Passwords must match and contain 12 to 1024 characters.");
  const salt = randomBytes(16);
  const hash = scryptSync(first, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
  console.log(`ADMIN_SESSION_SECRET=${randomBytes(48).toString("base64url")}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Could not create password hash.");
  process.exitCode = 1;
}
