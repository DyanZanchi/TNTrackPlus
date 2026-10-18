import { describe, expect, it } from "vitest";
import { ANATOMY_ASSETS, getApprovedAnatomyAssets, getDefaultAnatomyAsset } from "./assets";

describe("anatomy asset registry", () => {
  it("exposes only the approved front-facing diagram", () => {
    const approved = getApprovedAnatomyAssets();

    expect(approved).toHaveLength(1);
    expect(approved[0]?.view).toBe("front");
    expect(approved[0]?.src).toBe("/images/face-map.png");
  });

  it("keeps missing views unapproved and without image sources", () => {
    const unapproved = ANATOMY_ASSETS.filter((asset) => !asset.approved);

    expect(unapproved.map((asset) => asset.view)).toEqual([
      "left-profile",
      "right-profile",
      "teeth",
    ]);
    expect(unapproved.every((asset) => asset.src === "")).toBe(true);
  });

  it("uses the approved front view as the default asset", () => {
    expect(getDefaultAnatomyAsset().view).toBe("front");
  });
});
