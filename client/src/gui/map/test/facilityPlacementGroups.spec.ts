import {
  buildFacilityPlacementGroupTeleportLayout,
  cloneScenarioMetadata,
  createFacilityPlacementGroup,
  findFacilityPlacementGroupByFacilityId,
  getScenarioFacilityPlacementGroups,
  pruneFacilityPlacementGroups,
  resolveMatchingFacilityPlacementGroup,
  setScenarioFacilityPlacementGroups,
  type FacilityPlacementGroup,
} from "@/game/facilityPlacementGroups";

describe("facilityPlacementGroups", () => {
  it("creates a deduplicated group label and ids", () => {
    const group = createFacilityPlacementGroup(
      ["facility-a", "facility-b", "facility-a"],
      "천무 · 기본 3포대 분산",
      123
    );

    expect(group.label).toBe("천무 · 기본 3포대 분산");
    expect(group.createdAt).toBe(123);
    expect(group.facilityIds).toEqual(["facility-a", "facility-b"]);
    expect(group.id).toBeTruthy();
  });

  it("finds a group from a member facility id", () => {
    const groups: FacilityPlacementGroup[] = [
      {
        id: "group-a",
        label: "A",
        facilityIds: ["facility-1", "facility-2"],
        createdAt: 1,
      },
    ];

    expect(
      findFacilityPlacementGroupByFacilityId(groups, "facility-2")?.id
    ).toBe("group-a");
    expect(
      findFacilityPlacementGroupByFacilityId(groups, "facility-x")
    ).toBeNull();
  });

  it("matches only exact facility selections", () => {
    const groups: FacilityPlacementGroup[] = [
      {
        id: "group-a",
        label: "A",
        facilityIds: ["facility-1", "facility-2", "facility-3"],
        createdAt: 1,
      },
    ];

    expect(
      resolveMatchingFacilityPlacementGroup(groups, [
        "facility-3",
        "facility-1",
        "facility-2",
      ])?.id
    ).toBe("group-a");
    expect(
      resolveMatchingFacilityPlacementGroup(groups, [
        "facility-1",
        "facility-2",
      ])
    ).toBeNull();
  });

  it("prunes missing facilities and drops undersized groups", () => {
    const groups: FacilityPlacementGroup[] = [
      {
        id: "group-a",
        label: "A",
        facilityIds: ["facility-1", "facility-2", "facility-3"],
        createdAt: 1,
      },
      {
        id: "group-b",
        label: "B",
        facilityIds: ["facility-4", "facility-5"],
        createdAt: 2,
      },
    ];

    expect(
      pruneFacilityPlacementGroups(groups, [
        "facility-1",
        "facility-2",
        "facility-4",
      ])
    ).toEqual([
      {
        id: "group-a",
        label: "A",
        facilityIds: ["facility-1", "facility-2"],
        createdAt: 1,
      },
    ]);
  });

  it("builds teleport positions that preserve formation offsets", () => {
    const layout = buildFacilityPlacementGroupTeleportLayout(
      [
        { id: "left", latitude: 37.5, longitude: 126.8 },
        { id: "center", latitude: 37.5, longitude: 126.9 },
        { id: "right", latitude: 37.5, longitude: 127.0 },
      ],
      38.0,
      128.0
    );

    expect(layout).toHaveLength(3);
    expect(layout[0]).toMatchObject({ id: "left" });
    expect(layout[1]).toMatchObject({ id: "center" });
    expect(layout[2]).toMatchObject({ id: "right" });
    expect(layout[0]?.latitude).toBeCloseTo(38.0, 6);
    expect(layout[1]?.latitude).toBeCloseTo(38.0, 6);
    expect(layout[2]?.latitude).toBeCloseTo(38.0, 6);
    expect(layout[0]?.longitude).toBeCloseTo(127.9, 6);
    expect(layout[1]?.longitude).toBeCloseTo(128.0, 6);
    expect(layout[2]?.longitude).toBeCloseTo(128.1, 6);
  });

  it("stores facility placement groups inside scenario ui metadata", () => {
    const metadata = setScenarioFacilityPlacementGroups(
      {
        ui: { preserve: "yes" },
        author: "planner",
      },
      [
        {
          id: "group-a",
          label: "A",
          facilityIds: ["facility-1", "facility-2", "stale-id"],
          createdAt: 10,
        },
      ],
      ["facility-1", "facility-2"]
    );

    expect(metadata.author).toBe("planner");
    expect(metadata.ui?.preserve).toBe("yes");
    expect(metadata.ui?.facilityPlacementGroups).toEqual([
      {
        id: "group-a",
        label: "A",
        facilityIds: ["facility-1", "facility-2"],
        createdAt: 10,
      },
    ]);
  });

  it("reads cloned facility placement groups from scenario metadata", () => {
    const metadata = cloneScenarioMetadata({
      ui: {
        facilityPlacementGroups: [
          {
            id: "group-a",
            label: "A",
            facilityIds: ["facility-1", "facility-2"],
            createdAt: 10,
          },
        ],
      },
    });

    const groups = getScenarioFacilityPlacementGroups(metadata, [
      "facility-1",
      "facility-2",
    ]);
    groups[0]?.facilityIds.push("mutated");

    expect(metadata.ui?.facilityPlacementGroups?.[0]?.facilityIds).toEqual([
      "facility-1",
      "facility-2",
    ]);
  });
});
