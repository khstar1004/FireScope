import {
  getOfflineMapRegion,
  getOfflineSatelliteTileUrl,
  getOfflineVectorBasemapUrl,
  KOREA_OFFLINE_REGION,
  SEUNGJIN_OFFLINE_REGION,
} from "@/gui/map/offlineMapConfig";

describe("offlineMapConfig", () => {
  it("can use the Korea overview package for the 2D demo map", () => {
    const region = getOfflineMapRegion({
      forceOffline: true,
      preferredRegionId: KOREA_OFFLINE_REGION.id,
    });

    expect(region?.id).toBe("korea");
    expect(region?.defaultZoom).toBe(7);
    expect(getOfflineSatelliteTileUrl(KOREA_OFFLINE_REGION)).toBe(
      "/offline-map/korea/satellite-tiles.json"
    );
    expect(getOfflineVectorBasemapUrl(KOREA_OFFLINE_REGION)).toBe(
      "/offline-map/korea/vector/basemap.geojson"
    );
  });

  it("keeps a direct Seungjin tile template for 3D and flight simulation", () => {
    expect(
      getOfflineSatelliteTileUrl(SEUNGJIN_OFFLINE_REGION, { localOnly: true })
    ).toBe("/offline-map/seungjin/raster/satellite/{z}/{x}/{y}.jpg");
  });
});
