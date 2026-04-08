import {
  aircraftStyle,
  facilityStyle,
} from "@/gui/map/mapLayers/FeatureLayerStyles";
import DroneMapIconSvg from "@/gui/assets/svg/drone_map_24dp.svg";
import TankMapIconSvg from "@/gui/assets/svg/tank_map_24dp.svg";

function createFeatureLike(properties: Record<string, unknown>) {
  return {
    getProperties: () => properties,
  } as any;
}

describe("FeatureLayerStyles", () => {
  test("uses the drone icon for drone aircraft classes", () => {
    const style = aircraftStyle(
      createFeatureLike({
        className: "MQ-9 Reaper",
        heading: 90,
        selected: false,
        sideColor: "#000000",
      })
    );

    expect((style.getImage() as any).getSrc()).toBe(DroneMapIconSvg);
  });

  test("uses the tank icon for armored facility classes", () => {
    const style = facilityStyle(
      createFeatureLike({
        className: "K2 Black Panther",
        sideColor: "#000000",
      })
    );

    expect((style.getImage() as any).getSrc()).toBe(TankMapIconSvg);
  });
});
