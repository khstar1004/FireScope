import {
  aircraftStyle,
  facilityStyle,
  featureLabelStyle,
} from "@/gui/map/mapLayers/FeatureLayerStyles";
import DroneMapIconSvg from "@/gui/assets/svg/drone_map_24dp.svg";
import FlightIconSvg from "@/gui/assets/svg/flight_black_24dp.svg";
import TankMapIconSvg from "@/gui/assets/svg/tank_map_24dp.svg";

function createFeatureLike(properties: Record<string, unknown>) {
  return {
    getProperties: () => properties,
  } as any;
}

function getIconStyle(style: ReturnType<typeof aircraftStyle>) {
  return Array.isArray(style) ? style[style.length - 1] : style;
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

    expect((getIconStyle(style).getImage() as any).getSrc()).toBe(
      DroneMapIconSvg
    );
  });

  test("uses the tank icon for armored facility classes", () => {
    const style = facilityStyle(
      createFeatureLike({
        className: "K2 Black Panther",
        sideColor: "#000000",
      })
    );

    const iconStyle = Array.isArray(style) ? style[style.length - 1] : style;
    expect((iconStyle.getImage() as any).getSrc()).toBe(TankMapIconSvg);
  });

  test("adds a health ring when combat stats are present", () => {
    const style = aircraftStyle(
      createFeatureLike({
        className: "F-15K Slam Eagle",
        heading: 90,
        selected: false,
        sideColor: "#000000",
        currentHp: 55,
        maxHp: 100,
        healthRatio: 0.55,
      })
    );

    expect(Array.isArray(style)).toBe(true);
    expect(((style as any[])[1].getImage() as any).getSrc()).toBe(
      FlightIconSvg
    );
  });

  test("renders a combat label with HP meter for combat units", () => {
    const styles = featureLabelStyle(
      createFeatureLike({
        name: "Blue Destroyer",
        sideColor: "#1e90ff",
        currentHp: 60,
        maxHp: 100,
        healthRatio: 0.6,
      })
    ) as any[];

    expect(Array.isArray(styles)).toBe(true);
    expect(styles).toHaveLength(2);
    expect(styles[0].getText().getText()).toBe("Blue Destroyer");
    expect(styles[1].getText().getText()).toContain("WARN 60/100");
    expect(styles[1].getText().getText()).toContain("[|||||...]");
  });
});
