import { describe, it, expect } from "vitest";
import { computeCoverCrop, applyOffset } from "./crop";

describe("computeCoverCrop", () => {
  it("should crop width for landscape images", () => {
    const crop = computeCoverCrop(1920, 1080);
    expect(crop.sw).toBe(1080);
    expect(crop.sh).toBe(1080);
    expect(crop.sx).toBe(420); // (1920 - 1080) / 2
    expect(crop.sy).toBe(0);
  });

  it("should crop height for portrait images", () => {
    const crop = computeCoverCrop(1080, 1920);
    expect(crop.sw).toBe(1080);
    expect(crop.sh).toBe(1080);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(420); // (1920 - 1080) / 2
  });

  it("should return full image for square images", () => {
    const crop = computeCoverCrop(800, 800);
    expect(crop.sx).toBe(0);
    expect(crop.sy).toBe(0);
    expect(crop.sw).toBe(800);
    expect(crop.sh).toBe(800);
  });
});

describe("applyOffset", () => {
  it("should clamp to image bounds", () => {
    const crop = { sx: 0, sy: 0, sw: 100, sh: 100 };
    const result = applyOffset(crop, -50, -50, 200, 200);
    expect(result.sx).toBe(0);
    expect(result.sy).toBe(0);
  });

  it("should clamp when panning past right/bottom edges", () => {
    const crop = { sx: 50, sy: 50, sw: 100, sh: 100 };
    const result = applyOffset(crop, 200, 200, 200, 200);
    expect(result.sx).toBe(100); // 200 - 100
    expect(result.sy).toBe(100);
  });

  it("should return unchanged crop for zero delta", () => {
    const crop = { sx: 50, sy: 50, sw: 100, sh: 100 };
    const result = applyOffset(crop, 0, 0, 200, 200);
    expect(result).toEqual(crop);
  });

  it("should shift crop by delta within bounds", () => {
    const crop = { sx: 50, sy: 50, sw: 100, sh: 100 };
    const result = applyOffset(crop, 10, -20, 200, 200);
    expect(result.sx).toBe(60);
    expect(result.sy).toBe(30);
  });
});
