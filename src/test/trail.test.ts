import { describe, expect, it } from "vitest";
import { STOPS, filterStops, stopsForRoute } from "@/lib/trail";

describe("trail rules", () => {
  it("classic loop has the 8 main stops, extended adds the optional one", () => {
    expect(stopsForRoute("classic")).toHaveLength(8);
    expect(stopsForRoute("extended")).toHaveLength(9);
    expect(stopsForRoute("classic").some((s) => s.optional)).toBe(false);
  });
  it("filters visited / to visit and searches by area", () => {
    const v = new Set(["maddox"]);
    expect(filterStops(STOPS, v, "visited", "").map((s) => s.id)).toEqual(["maddox"]);
    expect(filterStops(STOPS, v, "todo", "")).toHaveLength(8);
    expect(filterStops(STOPS, v, "all", "lake terrace").map((s) => s.id)).toEqual(["bca", "samaj-sebi"]);
  });
});
