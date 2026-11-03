import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { createServer } from "node:net";

const browser = process.argv.includes("--browser");
const run = env => spawnSync(process.execPath, browser
  ? ["node_modules/@playwright/test/cli.js", "test"]
  : ["--import", "tsx", "--test", "tests/platform.test.ts"], { stdio: "inherit", env }).status ?? 1;

if (process.env.TEST_DATABASE_URL) {
  process.exitCode = run(process.env);
} else {
  const bin = process.env.PG_BIN ?? "/usr/lib/postgresql/16/bin";
  const directory = await mkdtemp(join(tmpdir(), "animalvs-test-pg-"));
  const listener = createServer();
  await new Promise(resolve => listener.listen(0, "127.0.0.1", resolve));
  const address = listener.address();
  if (!address || typeof address === "string") throw new Error("Cannot allocate database test port.");
  const port = address.port;
  await new Promise(resolve => listener.close(resolve));
  const data = join(directory, "data");
  let running = false;
  try {
    const args = ["-D", data, "-A", "trust", "-U", "animalvs", "--no-locale", "--encoding=UTF8"];
    if (process.env.PG_SHARE) args.push("-L", process.env.PG_SHARE);
    execFileSync(join(bin, "initdb"), args, { stdio: "pipe" });
    execFileSync(join(bin, "pg_ctl"), [
      "-D", data, "-l", join(directory, "server.log"), "-o", `-h 127.0.0.1 -p ${port} -k ${directory}`, "-w", "start",
    ], { stdio: "pipe" });
    running = true;
    execFileSync("createdb", ["-h", "127.0.0.1", "-p", String(port), "-U", "animalvs", "animalvs_dev"]);
    process.exitCode = run({
      ...process.env, TEST_DATABASE_URL: `postgresql://animalvs@127.0.0.1:${port}/animalvs_dev`,
      PG_TEST_DATA: data, PG_TEST_CTL: join(bin, "pg_ctl"),
    });
  } catch (error) {
    console.error("Isolated PostgreSQL verification failed. Install PostgreSQL server tools or set PG_BIN/PG_SHARE (or TEST_DATABASE_URL for integration tests).");
    if (error instanceof Error) console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (running) execFileSync(join(bin, "pg_ctl"), ["-D", data, "-m", "immediate", "-w", "stop"], { stdio: "pipe" });
    await rm(directory, { recursive: true, force: true });
  }
}
