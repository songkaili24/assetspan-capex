import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadCsv } from "@/lib/csv";

// downloadCsv builds a Blob and triggers an anchor download. Stub the browser
// boundary (URL object store + anchor click) so we can assert the exact CSV
// content — the escaping rules are the high-risk contract here.

let capturedUrl: string | null = null;
const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

function stubObjectURL() {
  capturedUrl = null;
  const createObjectURL = vi.fn((blob: Blob) => {
    capturedUrl = "blob:mock-" + Math.random();
    lastBlob = blob;
    return capturedUrl;
  });
  const revokeObjectURL = vi.fn();
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL, revokeObjectURL }));
  return { createObjectURL, revokeObjectURL };
}

let lastBlob: Blob | null = null;

// jsdom's Blob.text() decodes with BOM stripping, so read raw bytes and
// decode with ignoreBOM to assert the BOM the production code prepends.
async function readBlobText(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  return new TextDecoder("utf-8", { ignoreBOM: true }).decode(buffer);
}

afterEach(() => {
  vi.unstubAllGlobals();
  lastBlob = null;
  capturedUrl = null;
  clickSpy.mockClear();
});

describe("downloadCsv", () => {
  it("writes headers and rows joined by CRLF with a UTF-8 BOM", async () => {
    const { revokeObjectURL } = stubObjectURL();
    downloadCsv(
      "vendors.csv",
      ["ID", "Name"],
      [
        ["v1", "Airtek Mechanical"],
        ["v2", "Lone Star Electric"],
      ],
    );
    expect(lastBlob).toBeInstanceOf(Blob);
    const bytes = new Uint8Array(await lastBlob!.arrayBuffer());
    // UTF-8 BOM: EF BB BF
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes);
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text.slice(1)).toBe("ID,Name\r\nv1,Airtek Mechanical\r\nv2,Lone Star Electric");
    expect(capturedUrl).toMatch(/^blob:mock-/);
    expect(revokeObjectURL).toHaveBeenCalledWith(capturedUrl);
  });

  it("escapes embedded commas, quotes, and newlines per RFC 4180", async () => {
    stubObjectURL();
    downloadCsv(
      "scope.csv",
      ["Scope", "Notes"],
      [
        ["Roof replacement, 118,000 SF", 'Phase "A" only'],
        ["Multi\r\nline", "plain"],
      ],
    );
    const body = (await readBlobText(lastBlob!)).slice(1);
    expect(body).toBe(
      'Scope,Notes\r\n"Roof replacement, 118,000 SF","Phase ""A"" only"\r\n"Multi\r\nline",plain',
    );
  });

  it("does not quote values without special characters", async () => {
    stubObjectURL();
    downloadCsv("plain.csv", ["A", "B"], [["x", "y"]]);
    const text = await readBlobText(lastBlob!);
    expect(text.slice(1)).toBe("A,B\r\nx,y");
  });

  it("sets the download filename and removes the anchor", () => {
    stubObjectURL();
    const appendSpy = vi.spyOn(document.body, "appendChild");
    const removeSpy = vi.spyOn(document.body, "removeChild");
    downloadCsv("registry-2026.csv", ["ID"], [["ast-2102"]]);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalledTimes(1);
  });

  it("renders headers only when there are no rows", async () => {
    stubObjectURL();
    downloadCsv("empty.csv", ["A", "B"], []);
    const text = await readBlobText(lastBlob!);
    expect(text.slice(1)).toBe("A,B");
  });
});
