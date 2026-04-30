import { rmSync } from "node:fs";
import { resolve } from "node:path";

const dbPath = resolve(process.env.DATABASE_PATH || "./data/blog.sqlite");
for (const suffix of ["", "-shm", "-wal"]) {
  try {
    rmSync(`${dbPath}${suffix}`, { force: true });
  } catch {}
}

console.log(`Removed ${dbPath}`);
