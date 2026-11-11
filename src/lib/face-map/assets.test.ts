import { describe, expect, it } from "vitest";
import { ANATOMY_ASSETS, getApprovedAnatomyAssets, getDefaultAnatomyAsset } from "./assets";

describe("anatomy asset registry", () => {
  it("exposes the front, side, and teeth diagrams", () => {
    const approved = getApprovedAnatomyAssets();

    expect(approved.map((asset) => asset.view)).toEqual([
      "front",
      "left-profile",
      "right-profile",
      "teeth",
    ]);
    expect(approved[0]?.src).toBe("/images/face-map.png");
    expect(ANATOMY_ASSETS.every((asset) => asset.approved && asset.src)).toBe(true);
  });

  it("uses the approved front view as the default asset", () => {
    expect(getDefaultAnatomyAsset().view).toBe("front");
  });
});
