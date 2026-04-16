import type { AssetExperienceSummary } from "@/gui/experience/assetExperience";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";
import { EARTH_RADIUS_M, NAUTICAL_MILES_TO_METERS } from "@/utils/constants";

export interface TacticalPoint {
  x: number;
  y: number;
}

export type TacticalWeaponKind = "shell" | "rocket" | "missile" | "interceptor";

export type TacticalContactDomain = "ground" | "air" | "surface";

export interface TacticalWeaponConfig {
  label: string;
  kind: TacticalWeaponKind;
  speedMps: number;
  maxRangeM: number;
  splashRadiusM: number;
  cooldownSeconds: number;
  salvo: number;
  homing: boolean;
  damage: number;
  color: string;
}

export interface TacticalContactSeed {
  id: string;
  label: string;
  role: string;
  domain: TacticalContactDomain;
  position: TacticalPoint;
  waypoints: TacticalPoint[];
  speedMps: number;
  hitRadiusM: number;
  health: number;
}

export interface TacticalSiteSeed {
  id: string;
  label: string;
  kind: "base" | "objective" | "support" | "runway";
  position: TacticalPoint;
  radiusM: number;
}

export interface TacticalExperienceConfig {
  profile: ImmersiveExperienceProfile;
  modeTitle: string;
  modeDescription: string;
  unitLabel: string;
  controls: string[];
  baseZoom: number;
  maxSpeedMps: number;
  cruiseSpeedMps: number;
  reverseSpeedMps: number;
  turnRateDeg: number;
  sensorRangeM: number;
  primaryWeapon: TacticalWeaponConfig;
  supportWeapon: TacticalWeaponConfig;
  hostileContacts: TacticalContactSeed[];
  sites: TacticalSiteSeed[];
}

export interface TacticalScenarioSeed {
  origin: {
    lon: number;
    lat: number;
  };
  player: {
    label: string;
    position: TacticalPoint;
    headingDeg: number;
    ammoPrimary: number;
    ammoSupport: number;
  };
  config: TacticalExperienceConfig;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function nmToScaledMeters(
  rangeNm: number | undefined,
  fallbackNm: number,
  minMeters: number,
  maxMeters: number
) {
  return clamp(
    (rangeNm ?? fallbackNm) * NAUTICAL_MILES_TO_METERS,
    minMeters,
    maxMeters
  );
}

function speedToScaledMps(
  speed: number | undefined,
  fallbackMps: number,
  minMps: number,
  maxMps: number
) {
  if (speed === undefined || !Number.isFinite(speed)) {
    return fallbackMps;
  }

  const speedInMps = speed * 0.514444;
  return clamp(speedInMps, minMps, maxMps);
}

function createConfig(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
): TacticalExperienceConfig {
  switch (profile) {
    case "ground": {
      return {
        profile,
        modeTitle: "지상 기동 시뮬레이터",
        modeDescription:
          "실제 지도 위에서 전차 전술 축을 따라 이동하고, 표적을 추적하며 직사 화력을 운용합니다.",
        unitLabel: "Tracked Armor",
        controls: [
          "`W/S`: 전진 및 후진",
          "`A/D`: 차체 선회",
          "`Click`: 위협 표적 지정",
          "`F`: 전차포 발사",
          "`Enter`: 유도탄 발사",
          "`Space`: 추적 카메라 토글",
        ],
        baseZoom: 15,
        maxSpeedMps: speedToScaledMps(asset.speed, 15, 6, 19),
        cruiseSpeedMps: 11,
        reverseSpeedMps: 4.5,
        turnRateDeg: 46,
        sensorRangeM: nmToScaledMeters(asset.range, 1.4, 900, 2600),
        primaryWeapon: {
          label: "120mm Cannon",
          kind: "shell",
          speedMps: 920,
          maxRangeM: 2400,
          splashRadiusM: 38,
          cooldownSeconds: 0.95,
          salvo: 1,
          homing: false,
          damage: 120,
          color: "#ffd166",
        },
        supportWeapon: {
          label: "ATGM",
          kind: "missile",
          speedMps: 480,
          maxRangeM: 3600,
          splashRadiusM: 72,
          cooldownSeconds: 6.5,
          salvo: 1,
          homing: true,
          damage: 160,
          color: "#ff8c42",
        },
        hostileContacts: [
          {
            id: "hostile-wedge-1",
            label: "Red Armor 1",
            role: "선도 전차",
            domain: "ground",
            position: { x: 900, y: 460 },
            waypoints: [
              { x: 900, y: 460 },
              { x: 600, y: 720 },
              { x: 300, y: 420 },
            ],
            speedMps: 9,
            hitRadiusM: 34,
            health: 130,
          },
          {
            id: "hostile-wedge-2",
            label: "Red IFV",
            role: "기동 보병전투차",
            domain: "ground",
            position: { x: -420, y: 880 },
            waypoints: [
              { x: -420, y: 880 },
              { x: -180, y: 620 },
              { x: -620, y: 430 },
            ],
            speedMps: 11,
            hitRadiusM: 28,
            health: 90,
          },
          {
            id: "hostile-support-1",
            label: "Counter Battery",
            role: "후방 화력 차량",
            domain: "ground",
            position: { x: 1500, y: -150 },
            waypoints: [{ x: 1500, y: -150 }],
            speedMps: 0,
            hitRadiusM: 30,
            health: 80,
          },
        ],
        sites: [
          {
            id: "ground-staging",
            label: "Forward Staging",
            kind: "support",
            position: { x: -180, y: -260 },
            radiusM: 120,
          },
        ],
      };
    }
    case "fires": {
      return {
        profile,
        modeTitle: "화력 운용 시뮬레이터",
        modeDescription:
          "포대/런처를 실제 지도에 놓고 목표 구역에 사격을 집중합니다.",
        unitLabel: "Fires Battery",
        controls: [
          "`W/S`: 포대 위치 조정",
          "`A/D`: 발사 축 조정",
          "`Click`: 집중 사격 표적 지정",
          "`F`: 단발 화력",
          "`Enter`: 집중 사격 살보",
          "`Space`: 추적 카메라 토글",
        ],
        baseZoom: 13.8,
        maxSpeedMps: speedToScaledMps(asset.speed, 8, 3, 10),
        cruiseSpeedMps: 5.2,
        reverseSpeedMps: 2.2,
        turnRateDeg: 30,
        sensorRangeM: nmToScaledMeters(asset.range, 8, 2600, 7000),
        primaryWeapon: {
          label: "Rocket Shot",
          kind: "rocket",
          speedMps: 430,
          maxRangeM: 6500,
          splashRadiusM: 120,
          cooldownSeconds: 2.8,
          salvo: 1,
          homing: false,
          damage: 120,
          color: "#ffb703",
        },
        supportWeapon: {
          label: "Barrage",
          kind: "rocket",
          speedMps: 390,
          maxRangeM: 8200,
          splashRadiusM: 175,
          cooldownSeconds: 10,
          salvo: 4,
          homing: false,
          damage: 85,
          color: "#fb8500",
        },
        hostileContacts: [
          {
            id: "fires-hostile-hq",
            label: "Enemy C2",
            role: "지휘 차량",
            domain: "ground",
            position: { x: 4600, y: 1800 },
            waypoints: [{ x: 4600, y: 1800 }],
            speedMps: 0,
            hitRadiusM: 34,
            health: 100,
          },
          {
            id: "fires-hostile-convoy",
            label: "Supply Convoy",
            role: "보급 호송대",
            domain: "ground",
            position: { x: 2800, y: -1200 },
            waypoints: [
              { x: 2800, y: -1200 },
              { x: 3500, y: -800 },
              { x: 4200, y: -1400 },
            ],
            speedMps: 12,
            hitRadiusM: 30,
            health: 110,
          },
          {
            id: "fires-hostile-battery",
            label: "Enemy Battery",
            role: "대포병 화력",
            domain: "ground",
            position: { x: 5400, y: -200 },
            waypoints: [{ x: 5400, y: -200 }],
            speedMps: 0,
            hitRadiusM: 34,
            health: 130,
          },
        ],
        sites: [
          {
            id: "fires-fob",
            label: "Launch Position",
            kind: "support",
            position: { x: -260, y: -220 },
            radiusM: 140,
          },
          {
            id: "fires-objective",
            label: "Objective Grid",
            kind: "objective",
            position: { x: 4300, y: 300 },
            radiusM: 260,
          },
        ],
      };
    }
    case "defense": {
      return {
        profile,
        modeTitle: "방공 시뮬레이터",
        modeDescription:
          "레이더 추적 범위 안에서 공중 위협을 찾아 요격하고 방어 구역을 유지합니다.",
        unitLabel: "Air Defense Battery",
        controls: [
          "`W/S`: 발사대 재배치",
          "`A/D`: 발사 방위 조정",
          "`Click`: 우선 요격 표적 지정",
          "`F`: 근접 요격",
          "`Enter`: 장거리 요격",
          "`Space`: 추적 카메라 토글",
        ],
        baseZoom: 12.8,
        maxSpeedMps: speedToScaledMps(asset.speed, 6, 2, 8),
        cruiseSpeedMps: 4.4,
        reverseSpeedMps: 2.4,
        turnRateDeg: 24,
        sensorRangeM: nmToScaledMeters(asset.range, 16, 3200, 9500),
        primaryWeapon: {
          label: "Point Defense",
          kind: "interceptor",
          speedMps: 700,
          maxRangeM: 4200,
          splashRadiusM: 88,
          cooldownSeconds: 1.8,
          salvo: 1,
          homing: true,
          damage: 130,
          color: "#72efdd",
        },
        supportWeapon: {
          label: "Area Interceptor",
          kind: "missile",
          speedMps: 980,
          maxRangeM: 9000,
          splashRadiusM: 140,
          cooldownSeconds: 6.8,
          salvo: 2,
          homing: true,
          damage: 150,
          color: "#48cae4",
        },
        hostileContacts: [
          {
            id: "defense-hostile-striker",
            label: "Strike Jet",
            role: "저고도 침투기",
            domain: "air",
            position: { x: -5200, y: 1600 },
            waypoints: [
              { x: -5200, y: 1600 },
              { x: 5200, y: 200 },
            ],
            speedMps: 230,
            hitRadiusM: 48,
            health: 110,
          },
          {
            id: "defense-hostile-drone",
            label: "Recon Drone",
            role: "정찰 드론",
            domain: "air",
            position: { x: 2400, y: 3200 },
            waypoints: [
              { x: 2400, y: 3200 },
              { x: 1100, y: 1900 },
              { x: 3200, y: 900 },
            ],
            speedMps: 72,
            hitRadiusM: 34,
            health: 70,
          },
          {
            id: "defense-hostile-missile",
            label: "Cruise Missile",
            role: "지형추적 순항미사일",
            domain: "air",
            position: { x: -3800, y: -2600 },
            waypoints: [
              { x: -3800, y: -2600 },
              { x: 2600, y: -600 },
            ],
            speedMps: 250,
            hitRadiusM: 30,
            health: 90,
          },
        ],
        sites: [
          {
            id: "defense-grid",
            label: "Defense Grid",
            kind: "base",
            position: { x: 0, y: 0 },
            radiusM: 240,
          },
        ],
      };
    }
    case "maritime": {
      return {
        profile,
        modeTitle: "해상 전력 시뮬레이터",
        modeDescription:
          "실제 해역 지도 위에서 함정을 기동시키고 표적을 포착해 해상 화력을 운용합니다.",
        unitLabel: "Surface Combatant",
        controls: [
          "`W/S`: 항속 조절",
          "`A/D`: 선회",
          "`Click`: 위협 표적 지정",
          "`F`: 함포 사격",
          "`Enter`: 대함 미사일",
          "`Space`: 추적 카메라 토글",
        ],
        baseZoom: 13.2,
        maxSpeedMps: speedToScaledMps(asset.speed, 14, 6, 18),
        cruiseSpeedMps: 11.5,
        reverseSpeedMps: 4.8,
        turnRateDeg: 20,
        sensorRangeM: nmToScaledMeters(asset.range, 12, 2800, 8200),
        primaryWeapon: {
          label: "Naval Gun",
          kind: "shell",
          speedMps: 820,
          maxRangeM: 3200,
          splashRadiusM: 52,
          cooldownSeconds: 1.2,
          salvo: 1,
          homing: false,
          damage: 100,
          color: "#90e0ef",
        },
        supportWeapon: {
          label: "Anti-Ship Missile",
          kind: "missile",
          speedMps: 620,
          maxRangeM: 6200,
          splashRadiusM: 110,
          cooldownSeconds: 7.5,
          salvo: 2,
          homing: true,
          damage: 150,
          color: "#4cc9f0",
        },
        hostileContacts: [
          {
            id: "sea-hostile-corvette",
            label: "Hostile Corvette",
            role: "전방 위협 함정",
            domain: "surface",
            position: { x: 2600, y: 900 },
            waypoints: [
              { x: 2600, y: 900 },
              { x: 3600, y: 1300 },
              { x: 4200, y: 700 },
            ],
            speedMps: 11,
            hitRadiusM: 60,
            health: 140,
          },
          {
            id: "sea-hostile-fastboat",
            label: "Fast Boat",
            role: "고속 소형정",
            domain: "surface",
            position: { x: 1600, y: -1500 },
            waypoints: [
              { x: 1600, y: -1500 },
              { x: 2800, y: -700 },
              { x: 3600, y: -1800 },
            ],
            speedMps: 17,
            hitRadiusM: 36,
            health: 90,
          },
          {
            id: "sea-hostile-helo",
            label: "Hostile Helo",
            role: "대함 헬기",
            domain: "air",
            position: { x: -2200, y: 2800 },
            waypoints: [
              { x: -2200, y: 2800 },
              { x: 800, y: 2300 },
              { x: 2600, y: 1800 },
            ],
            speedMps: 82,
            hitRadiusM: 42,
            health: 90,
          },
        ],
        sites: [
          {
            id: "sea-patrol-box",
            label: "Patrol Box",
            kind: "objective",
            position: { x: 1800, y: 200 },
            radiusM: 320,
          },
        ],
      };
    }
    case "base": {
      return {
        profile,
        modeTitle: "기지 운용 시뮬레이터",
        modeDescription:
          "기지 경보 상황에서 선택한 대응 자산을 출격시키고, 포인트 디펜스와 함께 외곽 위협을 처리합니다.",
        unitLabel: "Base Response Cell",
        controls: [
          "`W/S`: 경보 섹터 / 카메라 거리 조정",
          "`A/D`: 대응 축 조정",
          "`Click`: 우선 대응 표적 지정",
          "`F`: 포인트 디펜스 발사",
          "`Enter`: 선택 자산 출격",
          "`Space`: 지휘 / 추적 카메라 토글",
        ],
        baseZoom: 15.3,
        maxSpeedMps: speedToScaledMps(asset.speed, 10, 4, 14),
        cruiseSpeedMps: 7.2,
        reverseSpeedMps: 3.4,
        turnRateDeg: 34,
        sensorRangeM: nmToScaledMeters(asset.range, 2.2, 900, 3800),
        primaryWeapon: {
          label: "Security Gun",
          kind: "shell",
          speedMps: 760,
          maxRangeM: 1800,
          splashRadiusM: 32,
          cooldownSeconds: 0.7,
          salvo: 1,
          homing: false,
          damage: 80,
          color: "#ffe066",
        },
        supportWeapon: {
          label: "Rapid Response Drone",
          kind: "missile",
          speedMps: 360,
          maxRangeM: 2800,
          splashRadiusM: 90,
          cooldownSeconds: 8,
          salvo: 1,
          homing: true,
          damage: 130,
          color: "#8ecae6",
        },
        hostileContacts: [
          {
            id: "base-hostile-drone",
            label: "Intruder Drone",
            role: "침투 드론",
            domain: "air",
            position: { x: 1400, y: 800 },
            waypoints: [
              { x: 1400, y: 800 },
              { x: 300, y: 400 },
              { x: -200, y: -120 },
            ],
            speedMps: 54,
            hitRadiusM: 26,
            health: 70,
          },
          {
            id: "base-hostile-truck",
            label: "Intrusion Truck",
            role: "주변 침투 차량",
            domain: "ground",
            position: { x: -1200, y: -1100 },
            waypoints: [
              { x: -1200, y: -1100 },
              { x: -420, y: -680 },
              { x: 220, y: -520 },
            ],
            speedMps: 13,
            hitRadiusM: 30,
            health: 95,
          },
          {
            id: "base-hostile-helo",
            label: "Raid Helo",
            role: "기지 습격 헬기",
            domain: "air",
            position: { x: 2200, y: -700 },
            waypoints: [
              { x: 2200, y: -700 },
              { x: 900, y: -220 },
              { x: -300, y: 200 },
            ],
            speedMps: 88,
            hitRadiusM: 40,
            health: 100,
          },
        ],
        sites: [
          {
            id: "base-runway",
            label: "Runway Axis",
            kind: "runway",
            position: { x: 0, y: 0 },
            radiusM: 340,
          },
          {
            id: "base-hangar",
            label: "Hangar Line",
            kind: "support",
            position: { x: -260, y: 180 },
            radiusM: 160,
          },
        ],
      };
    }
  }
}

export function normalizeHeading(heading: number) {
  return ((heading % 360) + 360) % 360;
}

export function localPointToLonLat(
  origin: { lon: number; lat: number },
  point: TacticalPoint
) {
  const latitudeRadians = (origin.lat * Math.PI) / 180;

  return {
    lon:
      origin.lon +
      (point.x / (EARTH_RADIUS_M * Math.cos(latitudeRadians))) *
        (180 / Math.PI),
    lat: origin.lat + (point.y / EARTH_RADIUS_M) * (180 / Math.PI),
  };
}

export function lonLatToLocalPoint(
  origin: { lon: number; lat: number },
  coordinates: { lon: number; lat: number }
) {
  const latitudeRadians = (origin.lat * Math.PI) / 180;

  return {
    x:
      (((coordinates.lon - origin.lon) * Math.PI) / 180) *
      EARTH_RADIUS_M *
      Math.cos(latitudeRadians),
    y: (((coordinates.lat - origin.lat) * Math.PI) / 180) * EARTH_RADIUS_M,
  };
}

export function createTacticalExperienceScenario(
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile
): TacticalScenarioSeed {
  const config = createConfig(asset, profile);

  return {
    origin: {
      lon: asset.longitude,
      lat: asset.latitude,
    },
    player: {
      label: asset.name,
      position: { x: 0, y: 0 },
      headingDeg: normalizeHeading(asset.heading ?? 0),
      ammoPrimary: config.primaryWeapon.kind === "shell" ? 20 : 12,
      ammoSupport: config.supportWeapon.kind === "missile" ? 8 : 6,
    },
    config,
  };
}
