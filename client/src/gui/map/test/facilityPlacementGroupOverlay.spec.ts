import { buildFacilityPlacementGroupOverlays } from "@/gui/map/facilityPlacementGroupOverlay";
import type { FacilityPlacementGroup } from "@/game/facilityPlacementGroups";
import { SIDE_COLOR } from "@/utils/colors";

describe("facilityPlacementGroupOverlay", () => {
  it("builds padded group overlays around member facilities", () => {
    const groups: FacilityPlacementGroup[] = [
      {
        id: "group-a",
        label: "천무 · 기본 3포대 분산",
        facilityIds: ["facility-1", "facility-2", "facility-3"],
        createdAt: 1,
      },
    ];

    const overlays = buildFacilityPlacementGroupOverlays(
      groups,
      [
        {
          id: "facility-1",
          latitude: 37.4,
          longitude: 126.8,
          sideColor: SIDE_COLOR.BLUE,
        },
        {
          id: "facility-2",
          latitude: 37.5,
          longitude: 126.9,
          sideColor: SIDE_COLOR.BLUE,
        },
        {
          id: "facility-3",
          latitude: 37.6,
          longitude: 127.0,
          sideColor: SIDE_COLOR.BLUE,
        },
      ],
      ["group-a"]
    );

    expect(overlays).toHaveLength(1);
    expect(overlays[0]).toMatchObject({
      id: "group-a",
      label: "천무 · 기본 3포대 분산",
      memberCount: 3,
      sideColor: SIDE_COLOR.BLUE,
      emphasized: true,
    });
    expect(overlays[0]?.centerLatitude).toBeCloseTo(37.5, 6);
    expect(overlays[0]?.centerLongitude).toBeCloseTo(126.9, 6);
    expect(overlays[0]?.ringCoordinates).toHaveLength(5);
    expect(overlays[0]?.ringCoordinates[0]).toEqual(
      overlays[0]?.ringCoordinates[4]
    );
    expect(overlays[0]?.ringCoordinates[0]?.[0]).toBeLessThan(126.8);
    expect(overlays[0]?.ringCoordinates[0]?.[1]).toBeLessThan(37.4);
    expect(overlays[0]?.ringCoordinates[2]?.[0]).toBeGreaterThan(127.0);
    expect(overlays[0]?.ringCoordinates[2]?.[1]).toBeGreaterThan(37.6);
  });

  it("drops undersized groups after missing facilities are removed", () => {
    const overlays = buildFacilityPlacementGroupOverlays(
      [
        {
          id: "group-a",
          label: "A",
          facilityIds: ["facility-1", "facility-2"],
          createdAt: 1,
        },
      ],
      [
        {
          id: "facility-1",
          latitude: 37.4,
          longitude: 126.8,
          sideColor: SIDE_COLOR.BLUE,
        },
      ]
    );

    expect(overlays).toEqual([]);
  });

  it("renders emphasized groups after non-emphasized groups", () => {
    const overlays = buildFacilityPlacementGroupOverlays(
      [
        {
          id: "group-b",
          label: "B",
          facilityIds: ["facility-3", "facility-4"],
          createdAt: 2,
        },
        {
          id: "group-a",
          label: "A",
          facilityIds: ["facility-1", "facility-2"],
          createdAt: 1,
        },
      ],
      [
        {
          id: "facility-1",
          latitude: 37.4,
          longitude: 126.8,
          sideColor: SIDE_COLOR.BLUE,
        },
        {
          id: "facility-2",
          latitude: 37.5,
          longitude: 126.9,
          sideColor: SIDE_COLOR.BLUE,
        },
        {
          id: "facility-3",
          latitude: 38.1,
          longitude: 127.4,
          sideColor: SIDE_COLOR.RED,
        },
        {
          id: "facility-4",
          latitude: 38.2,
          longitude: 127.5,
          sideColor: SIDE_COLOR.RED,
        },
      ],
      ["group-a"]
    );

    expect(overlays.map((overlay) => overlay.id)).toEqual([
      "group-b",
      "group-a",
    ]);
    expect(overlays[1]?.emphasized).toBe(true);
  });
});
