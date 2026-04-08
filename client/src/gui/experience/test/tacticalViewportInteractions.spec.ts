import {
  buildThreatRoster,
  findSelectableThreatId,
} from "@/gui/experience/tacticalViewportInteractions";

describe("tacticalViewportInteractions", () => {
  test("selects the nearest live hostile within the click radius", () => {
    const selectedId = findSelectableThreatId(
      [
        {
          id: "strike-1",
          label: "Strike Jet",
          role: "저고도 침투기",
          domain: "air",
          position: { x: 300, y: 180 },
          health: 110,
          hitRadiusM: 48,
          destroyed: false,
        },
        {
          id: "drone-1",
          label: "Recon Drone",
          role: "정찰 드론",
          domain: "air",
          position: { x: 920, y: 220 },
          health: 70,
          hitRadiusM: 34,
          destroyed: false,
        },
      ],
      { x: 260, y: 160 },
      500
    );

    expect(selectedId).toBe("strike-1");
  });

  test("ignores destroyed threats and sorts the roster by distance", () => {
    const roster = buildThreatRoster(
      [
        {
          id: "far-1",
          label: "Cruise Missile",
          role: "순항미사일",
          domain: "air",
          position: { x: 4200, y: 0 },
          health: 90,
          hitRadiusM: 30,
          destroyed: false,
        },
        {
          id: "near-1",
          label: "Recon Drone",
          role: "정찰 드론",
          domain: "air",
          position: { x: 1200, y: 0 },
          health: 70,
          hitRadiusM: 34,
          destroyed: false,
        },
        {
          id: "dead-1",
          label: "Dead Target",
          role: "제거됨",
          domain: "air",
          position: { x: 400, y: 0 },
          health: 0,
          hitRadiusM: 20,
          destroyed: true,
        },
      ],
      { x: 0, y: 0 }
    );

    expect(roster).toHaveLength(2);
    expect(roster[0].id).toBe("near-1");
    expect(roster[1].id).toBe("far-1");
  });
});
