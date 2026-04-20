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
      if (asset.kind === "aircraft") {
        return {
          profile,
          modeTitle: "항공 전투 시뮬레이터",
          modeDescription:
            "실제 3D 지도 위에서 선택한 전투기를 추적 시점으로 붙이고, 표적 전환과 공대공 무장 발사를 연속으로 운용합니다.",
          unitLabel: "Combat Air Patrol",
          controls: [
            "`W/S`: 추력과 접근 거리 조정",
            "`A/D`: 진입 축 조정",
            "`Click`: 우선 대응 표적 지정",
            "`F`: 단거리 무장",
            "`Enter`: 장거리 무장",
            "`Space`: 추적 / 전장 시점 전환",
          ],
          baseZoom: 14.6,
          maxSpeedMps: speedToScaledMps(asset.speed, 245, 140, 340),
          cruiseSpeedMps: speedToScaledMps(asset.speed, 210, 110, 260),
          reverseSpeedMps: 0,
          turnRateDeg: 68,
          sensorRangeM: nmToScaledMeters(asset.range, 24, 4500, 26000),
          primaryWeapon: {
            label: "Short Range Missile",
            kind: "missile",
            speedMps: 920,
            maxRangeM: 6800,
            splashRadiusM: 90,
            cooldownSeconds: 1.4,
            salvo: 1,
            homing: true,
            damage: 130,
            color: "#ffd166",
          },
          supportWeapon: {
            label: "BVR Missile",
            kind: "missile",
            speedMps: 1180,
            maxRangeM: 14000,
            splashRadiusM: 140,
            cooldownSeconds: 5.2,
            salvo: 1,
            homing: true,
            damage: 170,
            color: "#ff7b00",
          },
          hostileContacts: [
            {
              id: "air-hostile-strike-lead",
              label: "Strike Lead",
              role: "저고도 침투 편대장",
              domain: "air",
              position: { x: 7800, y: 320 },
              waypoints: [
                { x: 7800, y: 320 },
                { x: 4200, y: 180 },
                { x: 1400, y: -140 },
              ],
              speedMps: 248,
              hitRadiusM: 46,
              health: 112,
            },
            {
              id: "air-hostile-wingman",
              label: "Escort Wingman",
              role: "측면 엄호기",
              domain: "air",
              position: { x: 7600, y: -560 },
              waypoints: [
                { x: 7600, y: -560 },
                { x: 3900, y: -280 },
                { x: 1500, y: 220 },
              ],
              speedMps: 236,
              hitRadiusM: 42,
              health: 104,
            },
            {
              id: "air-hostile-decoy",
              label: "Decoy Drone",
              role: "기만 드론",
              domain: "air",
              position: { x: 6200, y: 1800 },
              waypoints: [
                { x: 6200, y: 1800 },
                { x: 3600, y: 920 },
                { x: 2100, y: 520 },
              ],
              speedMps: 118,
              hitRadiusM: 28,
              health: 72,
            },
            {
              id: "air-hostile-cruise",
              label: "Cruise Threat",
              role: "후속 순항 위협",
              domain: "air",
              position: { x: 9300, y: -1440 },
              waypoints: [
                { x: 9300, y: -1440 },
                { x: 5200, y: -780 },
                { x: 1800, y: -140 },
              ],
              speedMps: 272,
              hitRadiusM: 24,
              health: 82,
            },
          ],
          sites: [
            {
              id: "air-cap-anchor",
              label: "CAP Gate",
              kind: "support",
              position: { x: -900, y: -520 },
              radiusM: 220,
            },
            {
              id: "air-intercept-box",
              label: "Intercept Box",
              kind: "objective",
              position: { x: 5400, y: 260 },
              radiusM: 420,
            },
          ],
        };
      }

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

function applyBaseOperationMode(
  config: TacticalExperienceConfig,
  asset: AssetExperienceSummary,
  operationMode?: string
): TacticalExperienceConfig {
  if (asset.kind !== "aircraft") {
    return config;
  }

  switch (operationMode) {
    case "drone-watch":
      return {
        ...config,
        modeDescription:
          "드론 감시 축으로 천천히 접근하며 체공 감시를 유지하고, 느린 위협부터 순차적으로 차단하는 항공 감시 시뮬레이션입니다.",
        maxSpeedMps: speedToScaledMps(asset.speed, 98, 52, 140),
        cruiseSpeedMps: 74,
        turnRateDeg: 44,
        sensorRangeM: Math.max(config.sensorRangeM, 12000),
        primaryWeapon: {
          ...config.primaryWeapon,
          label: "Precision Strike",
          cooldownSeconds: 1.1,
          maxRangeM: 5200,
        },
        supportWeapon: {
          ...config.supportWeapon,
          label: "Guided Support Missile",
          maxRangeM: 7600,
          cooldownSeconds: 4.6,
        },
        hostileContacts: [
          {
            id: "drone-watch-intruder-1",
            label: "Recon Copter",
            role: "저고도 정찰 헬기",
            domain: "air",
            position: { x: 4200, y: 880 },
            waypoints: [
              { x: 4200, y: 880 },
              { x: 2400, y: 460 },
              { x: 900, y: 220 },
            ],
            speedMps: 92,
            hitRadiusM: 34,
            health: 84,
          },
          {
            id: "drone-watch-intruder-2",
            label: "Raid Drone",
            role: "외곽 침투 드론",
            domain: "air",
            position: { x: 3600, y: -1240 },
            waypoints: [
              { x: 3600, y: -1240 },
              { x: 1800, y: -580 },
              { x: 640, y: 40 },
            ],
            speedMps: 86,
            hitRadiusM: 26,
            health: 72,
          },
          {
            id: "drone-watch-ground",
            label: "Border Vehicle",
            role: "접경 침투 차량",
            domain: "ground",
            position: { x: 2800, y: 1600 },
            waypoints: [
              { x: 2800, y: 1600 },
              { x: 2100, y: 1040 },
              { x: 1500, y: 620 },
            ],
            speedMps: 18,
            hitRadiusM: 28,
            health: 92,
          },
        ],
        sites: [
          {
            id: "drone-watch-orbit",
            label: "Persistent Orbit",
            kind: "support",
            position: { x: -640, y: -280 },
            radiusM: 260,
          },
          {
            id: "drone-watch-box",
            label: "Watch Sector",
            kind: "objective",
            position: { x: 2800, y: 420 },
            radiusM: 340,
          },
        ],
      };
    case "quick-scramble":
      return {
        ...config,
        modeDescription:
          "경보 발령 직후 활주축을 박차고 올라가 적 침투 편대를 짧은 시간 안에 요격하는 전투기 대응 시뮬레이션입니다.",
        supportWeapon: {
          ...config.supportWeapon,
          label: "Fox-3 Intercept",
          maxRangeM: 15200,
          cooldownSeconds: 4.8,
        },
        hostileContacts: [
          {
            id: "scramble-striker",
            label: "Strike Package",
            role: "전면 침투기 편대",
            domain: "air",
            position: { x: 8800, y: 180 },
            waypoints: [
              { x: 8800, y: 180 },
              { x: 5200, y: 120 },
              { x: 2100, y: -120 },
            ],
            speedMps: 264,
            hitRadiusM: 50,
            health: 126,
          },
          {
            id: "scramble-cover",
            label: "Cover Flight",
            role: "측면 엄호 편대",
            domain: "air",
            position: { x: 8100, y: -980 },
            waypoints: [
              { x: 8100, y: -980 },
              { x: 4800, y: -420 },
              { x: 1900, y: 120 },
            ],
            speedMps: 248,
            hitRadiusM: 44,
            health: 108,
          },
          {
            id: "scramble-decoy",
            label: "Decoy UAV",
            role: "기만 무인기",
            domain: "air",
            position: { x: 6200, y: 1680 },
            waypoints: [
              { x: 6200, y: 1680 },
              { x: 4100, y: 760 },
              { x: 2400, y: 520 },
            ],
            speedMps: 126,
            hitRadiusM: 28,
            health: 70,
          },
          {
            id: "scramble-cruise",
            label: "Follow-on Cruise",
            role: "후속 순항 위협",
            domain: "air",
            position: { x: 10400, y: -1860 },
            waypoints: [
              { x: 10400, y: -1860 },
              { x: 6200, y: -860 },
              { x: 2400, y: -120 },
            ],
            speedMps: 284,
            hitRadiusM: 24,
            health: 86,
          },
        ],
        sites: [
          {
            id: "scramble-line",
            label: "Scramble Line",
            kind: "support",
            position: { x: -920, y: -420 },
            radiusM: 220,
          },
          {
            id: "scramble-intercept",
            label: "Forward Intercept",
            kind: "objective",
            position: { x: 6200, y: 160 },
            radiusM: 460,
          },
        ],
      };
    default:
      return config;
  }
}

function applyGroundOperationMode(
  config: TacticalExperienceConfig,
  operationMode?: string
): TacticalExperienceConfig {
  switch (operationMode) {
    case "convoy-guard":
      return {
        ...config,
        modeDescription:
          "호송 축을 따라 이동하는 차량군을 엄호하며 측방 매복과 차단 세력을 빠르게 정리합니다.",
        sensorRangeM: Math.max(config.sensorRangeM, 2100),
        hostileContacts: [
          {
            id: "ground-convoy-ifv",
            label: "Ambush IFV",
            role: "측방 매복 IFV",
            domain: "ground",
            position: { x: 640, y: 740 },
            waypoints: [
              { x: 640, y: 740 },
              { x: 360, y: 520 },
              { x: 110, y: 630 },
            ],
            speedMps: 10,
            hitRadiusM: 28,
            health: 96,
          },
          {
            id: "ground-convoy-apc",
            label: "Raid APC",
            role: "호송 차단 장갑차",
            domain: "ground",
            position: { x: -520, y: 1010 },
            waypoints: [
              { x: -520, y: 1010 },
              { x: -210, y: 760 },
              { x: 140, y: 820 },
            ],
            speedMps: 12,
            hitRadiusM: 30,
            health: 104,
          },
          {
            id: "ground-convoy-at",
            label: "AT Truck",
            role: "매복 대전차팀",
            domain: "ground",
            position: { x: 1380, y: -120 },
            waypoints: [{ x: 1380, y: -120 }],
            speedMps: 0,
            hitRadiusM: 24,
            health: 76,
          },
          {
            id: "ground-convoy-rear",
            label: "Blocking Armor",
            role: "후방 차단 전차",
            domain: "ground",
            position: { x: 1780, y: 360 },
            waypoints: [
              { x: 1780, y: 360 },
              { x: 1290, y: 540 },
            ],
            speedMps: 8,
            hitRadiusM: 34,
            health: 134,
          },
        ],
        sites: [
          {
            id: "ground-convoy-staging",
            label: "Escort Form-Up",
            kind: "support",
            position: { x: -220, y: -200 },
            radiusM: 130,
          },
          {
            id: "ground-convoy-route",
            label: "Convoy Route",
            kind: "objective",
            position: { x: 520, y: 420 },
            radiusM: 220,
          },
          {
            id: "ground-convoy-checkpoint",
            label: "Checkpoint Wolf",
            kind: "support",
            position: { x: 1120, y: 820 },
            radiusM: 150,
          },
        ],
      };
    case "command-post":
      return {
        ...config,
        modeDescription:
          "전술 지휘소 접근축을 감시하며 정찰 차량과 후방 화력 차량을 우선 제거합니다.",
        hostileContacts: [
          {
            id: "ground-cp-scout",
            label: "Recon APC",
            role: "지휘소 탐지 차량",
            domain: "ground",
            position: { x: 780, y: 660 },
            waypoints: [
              { x: 780, y: 660 },
              { x: 520, y: 410 },
              { x: 190, y: 300 },
            ],
            speedMps: 11,
            hitRadiusM: 28,
            health: 92,
          },
          {
            id: "ground-cp-raid",
            label: "Strike Truck",
            role: "지휘소 습격 차량",
            domain: "ground",
            position: { x: -260, y: 1160 },
            waypoints: [
              { x: -260, y: 1160 },
              { x: -80, y: 720 },
              { x: 120, y: 450 },
            ],
            speedMps: 13,
            hitRadiusM: 26,
            health: 88,
          },
          {
            id: "ground-cp-battery",
            label: "Fire Support Truck",
            role: "지휘소 지원 화력",
            domain: "ground",
            position: { x: 1540, y: -80 },
            waypoints: [{ x: 1540, y: -80 }],
            speedMps: 0,
            hitRadiusM: 30,
            health: 84,
          },
          {
            id: "ground-cp-armor",
            label: "Guard Tank",
            role: "후속 중장갑",
            domain: "ground",
            position: { x: 1820, y: 460 },
            waypoints: [
              { x: 1820, y: 460 },
              { x: 1350, y: 570 },
            ],
            speedMps: 7,
            hitRadiusM: 34,
            health: 142,
          },
        ],
        sites: [
          {
            id: "ground-cp-node",
            label: "Command Node",
            kind: "base",
            position: { x: 120, y: 90 },
            radiusM: 180,
          },
          {
            id: "ground-cp-ridge",
            label: "Relay Ridge",
            kind: "objective",
            position: { x: 760, y: 580 },
            radiusM: 170,
          },
          {
            id: "ground-cp-fallback",
            label: "Fallback Route",
            kind: "support",
            position: { x: -260, y: -260 },
            radiusM: 120,
          },
        ],
      };
    case "breakthrough":
      return {
        ...config,
        modeDescription:
          "선도 기갑 전력이 돌파축을 열고 후속 전력을 들이기 위해 전차와 후방 화력 차량을 순차 제거합니다.",
        hostileContacts: [
          ...config.hostileContacts,
          {
            id: "ground-breakthrough-tank",
            label: "Reserve Armor",
            role: "예비 전차",
            domain: "ground",
            position: { x: 1160, y: 980 },
            waypoints: [
              { x: 1160, y: 980 },
              { x: 760, y: 760 },
              { x: 360, y: 520 },
            ],
            speedMps: 8,
            hitRadiusM: 34,
            health: 132,
          },
        ],
        sites: [
          ...config.sites,
          {
            id: "ground-breakthrough-lane",
            label: "Breach Lane",
            kind: "objective",
            position: { x: 620, y: 480 },
            radiusM: 200,
          },
        ],
      };
    default:
      return config;
  }
}

function applyFiresOperationMode(
  config: TacticalExperienceConfig,
  operationMode?: string
): TacticalExperienceConfig {
  switch (operationMode) {
    case "counter-battery":
      return {
        ...config,
        modeDescription:
          "적 포대의 발사 원점을 포착하고 즉시 반격 사격 후 재배치까지 이어가는 대포병 시뮬레이션입니다.",
        supportWeapon: {
          ...config.supportWeapon,
          label: "Counter Battery Salvo",
          cooldownSeconds: 8.4,
          salvo: 3,
          splashRadiusM: 150,
        },
        hostileContacts: [
          {
            id: "fires-cb-battery",
            label: "Hostile Gun Line",
            role: "적 포대",
            domain: "ground",
            position: { x: 4300, y: 980 },
            waypoints: [{ x: 4300, y: 980 }],
            speedMps: 0,
            hitRadiusM: 36,
            health: 132,
          },
          {
            id: "fires-cb-fdc",
            label: "FDC Vehicle",
            role: "사격지휘 차량",
            domain: "ground",
            position: { x: 3660, y: 1340 },
            waypoints: [{ x: 3660, y: 1340 }],
            speedMps: 0,
            hitRadiusM: 28,
            health: 84,
          },
          {
            id: "fires-cb-ammo",
            label: "Ammo Truck",
            role: "탄약 보급 차량",
            domain: "ground",
            position: { x: 4860, y: 620 },
            waypoints: [
              { x: 4860, y: 620 },
              { x: 5280, y: 420 },
            ],
            speedMps: 7,
            hitRadiusM: 28,
            health: 76,
          },
          {
            id: "fires-cb-displace",
            label: "Displacing Launcher",
            role: "기동 발사대",
            domain: "ground",
            position: { x: 5220, y: -220 },
            waypoints: [
              { x: 5220, y: -220 },
              { x: 5680, y: -540 },
            ],
            speedMps: 9,
            hitRadiusM: 34,
            health: 108,
          },
        ],
        sites: [
          {
            id: "fires-cb-launch",
            label: "Counter Fire Position",
            kind: "support",
            position: { x: -320, y: -260 },
            radiusM: 140,
          },
          {
            id: "fires-cb-cue",
            label: "Radar Cue",
            kind: "support",
            position: { x: 2100, y: 420 },
            radiusM: 180,
          },
          {
            id: "fires-cb-guns",
            label: "Enemy Gun Line",
            kind: "objective",
            position: { x: 4340, y: 940 },
            radiusM: 260,
          },
        ],
      };
    case "saturation":
      return {
        ...config,
        modeDescription:
          "넓은 집결지에 다연장 살보를 쏟아부어 적 기동축 전체를 눌러 두는 시뮬레이션입니다.",
        supportWeapon: {
          ...config.supportWeapon,
          label: "Saturation Barrage",
          cooldownSeconds: 11.5,
          salvo: 6,
          splashRadiusM: 210,
          damage: 78,
        },
        hostileContacts: [
          {
            id: "fires-sat-column-1",
            label: "Armor Column Lead",
            role: "선도 기갑",
            domain: "ground",
            position: { x: 3600, y: 980 },
            waypoints: [
              { x: 3600, y: 980 },
              { x: 4160, y: 840 },
            ],
            speedMps: 11,
            hitRadiusM: 32,
            health: 118,
          },
          {
            id: "fires-sat-column-2",
            label: "Armor Column Mid",
            role: "종심 기갑",
            domain: "ground",
            position: { x: 3920, y: 620 },
            waypoints: [
              { x: 3920, y: 620 },
              { x: 4460, y: 520 },
            ],
            speedMps: 10,
            hitRadiusM: 32,
            health: 114,
          },
          {
            id: "fires-sat-column-3",
            label: "Support Trucks",
            role: "지원 차량대",
            domain: "ground",
            position: { x: 4340, y: 280 },
            waypoints: [
              { x: 4340, y: 280 },
              { x: 4840, y: 120 },
            ],
            speedMps: 9,
            hitRadiusM: 28,
            health: 92,
          },
          {
            id: "fires-sat-column-4",
            label: "Reserve Battery",
            role: "예비 화력",
            domain: "ground",
            position: { x: 4580, y: -120 },
            waypoints: [{ x: 4580, y: -120 }],
            speedMps: 0,
            hitRadiusM: 34,
            health: 126,
          },
          {
            id: "fires-sat-column-5",
            label: "Supply Node",
            role: "집결 보급소",
            domain: "ground",
            position: { x: 4940, y: 520 },
            waypoints: [{ x: 4940, y: 520 }],
            speedMps: 0,
            hitRadiusM: 34,
            health: 108,
          },
        ],
        sites: [
          {
            id: "fires-sat-fob",
            label: "Salvo Position",
            kind: "support",
            position: { x: -320, y: -240 },
            radiusM: 150,
          },
          {
            id: "fires-sat-grid",
            label: "Saturation Box",
            kind: "objective",
            position: { x: 4300, y: 420 },
            radiusM: 360,
          },
        ],
      };
    case "deep-strike":
      return {
        ...config,
        hostileContacts: [
          ...config.hostileContacts,
          {
            id: "fires-deep-radar",
            label: "Air Defense Radar",
            role: "표적 지역 방공 레이더",
            domain: "ground",
            position: { x: 5080, y: 940 },
            waypoints: [{ x: 5080, y: 940 }],
            speedMps: 0,
            hitRadiusM: 30,
            health: 92,
          },
        ],
        sites: [
          ...config.sites,
          {
            id: "fires-deep-relay",
            label: "Target Relay",
            kind: "support",
            position: { x: 2380, y: 560 },
            radiusM: 180,
          },
        ],
      };
    default:
      return config;
  }
}

function applyDefenseOperationMode(
  config: TacticalExperienceConfig,
  operationMode?: string
): TacticalExperienceConfig {
  switch (operationMode) {
    case "point-defense":
      return {
        ...config,
        modeDescription:
          "핵심 거점에 근접 침투하는 드론, 헬기, 순항 위협을 즉응 요격으로 끊어 내는 근접 방어 시뮬레이션입니다.",
        sensorRangeM: 4600,
        primaryWeapon: {
          ...config.primaryWeapon,
          cooldownSeconds: 1.2,
          maxRangeM: 3600,
          splashRadiusM: 72,
        },
        supportWeapon: {
          ...config.supportWeapon,
          cooldownSeconds: 5.2,
          maxRangeM: 6200,
          salvo: 1,
        },
        hostileContacts: [
          {
            id: "defense-pd-drone-1",
            label: "Attack Drone 1",
            role: "근접 침투 드론",
            domain: "air",
            position: { x: 1100, y: 1400 },
            waypoints: [
              { x: 1100, y: 1400 },
              { x: 420, y: 420 },
              { x: 80, y: 120 },
            ],
            speedMps: 78,
            hitRadiusM: 28,
            health: 66,
          },
          {
            id: "defense-pd-drone-2",
            label: "Attack Drone 2",
            role: "후속 드론",
            domain: "air",
            position: { x: -1380, y: 980 },
            waypoints: [
              { x: -1380, y: 980 },
              { x: -520, y: 360 },
              { x: -60, y: 40 },
            ],
            speedMps: 74,
            hitRadiusM: 28,
            health: 64,
          },
          {
            id: "defense-pd-helo",
            label: "Raid Helo",
            role: "근접 침투 헬기",
            domain: "air",
            position: { x: 1860, y: -620 },
            waypoints: [
              { x: 1860, y: -620 },
              { x: 760, y: -240 },
              { x: 220, y: 40 },
            ],
            speedMps: 96,
            hitRadiusM: 38,
            health: 94,
          },
          {
            id: "defense-pd-missile",
            label: "Sea-Skimming Missile",
            role: "근접 순항 위협",
            domain: "air",
            position: { x: -2100, y: -1180 },
            waypoints: [
              { x: -2100, y: -1180 },
              { x: -700, y: -220 },
              { x: 120, y: 0 },
            ],
            speedMps: 245,
            hitRadiusM: 28,
            health: 88,
          },
        ],
        sites: [
          {
            id: "defense-pd-grid",
            label: "Protected Site",
            kind: "base",
            position: { x: 0, y: 0 },
            radiusM: 220,
          },
        ],
      };
    case "radar-picket":
      return {
        ...config,
        modeDescription:
          "전방 레이더 노드가 조기 탐지 정보를 넘기고 후방 요격 결심을 지원하는 감시 중심 시뮬레이션입니다.",
        sensorRangeM: 10800,
        supportWeapon: {
          ...config.supportWeapon,
          label: "Long Range Interceptor",
          maxRangeM: 9800,
          cooldownSeconds: 7.6,
        },
        hostileContacts: [
          {
            id: "defense-rp-striker",
            label: "Strike Package",
            role: "저고도 침투기 편대",
            domain: "air",
            position: { x: -7600, y: 2200 },
            waypoints: [
              { x: -7600, y: 2200 },
              { x: -2200, y: 620 },
              { x: 2200, y: 120 },
            ],
            speedMps: 236,
            hitRadiusM: 48,
            health: 112,
          },
          {
            id: "defense-rp-missile",
            label: "Cruise Wave",
            role: "종심 순항미사일",
            domain: "air",
            position: { x: -6900, y: -2600 },
            waypoints: [
              { x: -6900, y: -2600 },
              { x: -1400, y: -820 },
              { x: 2400, y: -140 },
            ],
            speedMps: 252,
            hitRadiusM: 30,
            health: 92,
          },
          {
            id: "defense-rp-drone",
            label: "Recon Drone",
            role: "전방 정찰 드론",
            domain: "air",
            position: { x: 3600, y: 4200 },
            waypoints: [
              { x: 3600, y: 4200 },
              { x: 1400, y: 2400 },
              { x: 4200, y: 1500 },
            ],
            speedMps: 80,
            hitRadiusM: 30,
            health: 70,
          },
          {
            id: "defense-rp-decoy",
            label: "Decoy Flight",
            role: "기만 침투기",
            domain: "air",
            position: { x: 5200, y: -3400 },
            waypoints: [
              { x: 5200, y: -3400 },
              { x: 1200, y: -1800 },
              { x: -1200, y: -200 },
            ],
            speedMps: 214,
            hitRadiusM: 42,
            health: 98,
          },
        ],
        sites: [
          {
            id: "defense-rp-grid",
            label: "Rear Defense Grid",
            kind: "base",
            position: { x: 0, y: 0 },
            radiusM: 240,
          },
          {
            id: "defense-rp-radar",
            label: "Forward Radar Picket",
            kind: "support",
            position: { x: -2800, y: 1600 },
            radiusM: 220,
          },
        ],
      };
    case "layered-shield":
      return {
        ...config,
        hostileContacts: [
          ...config.hostileContacts,
          {
            id: "defense-layered-decoy",
            label: "Decoy UAV",
            role: "기만 드론",
            domain: "air",
            position: { x: 3200, y: -3400 },
            waypoints: [
              { x: 3200, y: -3400 },
              { x: 900, y: -1400 },
              { x: 2200, y: -320 },
            ],
            speedMps: 68,
            hitRadiusM: 26,
            health: 62,
          },
        ],
        sites: [
          ...config.sites,
          {
            id: "defense-layered-radar",
            label: "Forward Sensor Ring",
            kind: "support",
            position: { x: -1200, y: 1180 },
            radiusM: 180,
          },
        ],
      };
    default:
      return config;
  }
}

function applyOperationModeScenario(
  config: TacticalExperienceConfig,
  asset: AssetExperienceSummary,
  profile: ImmersiveExperienceProfile,
  operationMode?: string
): TacticalExperienceConfig {
  switch (profile) {
    case "ground":
      return applyGroundOperationMode(config, operationMode);
    case "fires":
      return applyFiresOperationMode(config, operationMode);
    case "defense":
      return applyDefenseOperationMode(config, operationMode);
    case "base":
      return applyBaseOperationMode(config, asset, operationMode);
    default:
      return config;
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
  profile: ImmersiveExperienceProfile,
  operationMode?: string
): TacticalScenarioSeed {
  const config = applyOperationModeScenario(
    createConfig(asset, profile),
    asset,
    profile,
    operationMode
  );

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
