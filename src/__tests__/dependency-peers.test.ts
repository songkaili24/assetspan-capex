import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guards against the ERESOLVE failure on Vercel: vitest 5 declares an
 * optional peer of @types/node "^22.0.0 || >=24.0.0" and vite 8 declares
 * "^20.19.0 || >=22.12.0". The installed @types/node must satisfy both,
 * otherwise npm install fails under strict peer resolution.
 */
function majorOf(version: string): number {
  return Number(version.split(".")[0]);
}

function satisfiesRange(version: string, range: string): boolean {
  const major = majorOf(version);
  return range.split(" || ").some((part) => {
    const min = Number(part.replace(/[^0-9]/g, " ").trim().split(/\s+/)[0]);
    return Number.isFinite(min) && major >= min;
  });
}

function readPeerRange(pkg: string, peer: string): string {
  const manifest = JSON.parse(
    readFileSync(resolve(process.cwd(), "node_modules", pkg, "package.json"), "utf8"),
  ) as { peerDependencies?: Record<string, string> };
  const range = manifest.peerDependencies?.[peer];
  expect(range, `${pkg} should declare a peer dependency on ${peer}`).toBeTruthy();
  return range as string;
}

describe("dependency peer compatibility", () => {
  const root = JSON.parse(
    readFileSync(resolve(process.cwd(), "package.json"), "utf8"),
  ) as { devDependencies: Record<string, string> };

  it("resolves a single @types/node version satisfying vite and vitest peers", () => {
    const declared = root.devDependencies["@types/node"];
    expect(declared).toBeDefined();
    expect(declared).toMatch(/^\^2[2-9]/);

    const installed = JSON.parse(
      readFileSync(resolve(process.cwd(), "node_modules", "@types/node", "package.json"), "utf8"),
    ) as { version: string };

    expect(satisfiesRange(installed.version, readPeerRange("vite", "@types/node"))).toBe(true);
    expect(satisfiesRange(installed.version, readPeerRange("vitest", "@types/node"))).toBe(true);
  });
});
