import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { AssetExperienceKind } from "@/gui/experience/assetExperience";
import type { ImmersiveExperienceProfile } from "@/gui/experience/immersiveExperience";

interface ImmersiveAssetViewportProps {
  profile: ImmersiveExperienceProfile;
  assetKind: AssetExperienceKind;
  assetName: string;
  accentColor: string;
  glowColor: string;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface Face {
  points: Vec3[];
  color: string;
}

interface SceneConfig {
  faces: Face[];
  initialYaw: number;
  initialPitch: number;
  autoSpin: number;
  cameraDistance: number;
  scale: number;
  shadowWidth: number;
  shadowHeight: number;
  verticalOffset: number;
}

function vector(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function translatePoint(point: Vec3, offset: Vec3): Vec3 {
  return {
    x: point.x + offset.x,
    y: point.y + offset.y,
    z: point.z + offset.z,
  };
}

function buildFace(points: Vec3[], offset: Vec3, color: string): Face {
  return {
    points: points.map((point) => translatePoint(point, offset)),
    color,
  };
}

function createBoxFaces(center: Vec3, size: Vec3, color: string): Face[] {
  const halfX = size.x / 2;
  const halfY = size.y / 2;
  const halfZ = size.z / 2;
  const vertices = [
    vector(-halfX, -halfY, -halfZ),
    vector(halfX, -halfY, -halfZ),
    vector(halfX, halfY, -halfZ),
    vector(-halfX, halfY, -halfZ),
    vector(-halfX, -halfY, halfZ),
    vector(halfX, -halfY, halfZ),
    vector(halfX, halfY, halfZ),
    vector(-halfX, halfY, halfZ),
  ];

  return [
    buildFace(
      [vertices[0], vertices[3], vertices[2], vertices[1]],
      center,
      color
    ),
    buildFace(
      [vertices[4], vertices[5], vertices[6], vertices[7]],
      center,
      color
    ),
    buildFace(
      [vertices[0], vertices[4], vertices[7], vertices[3]],
      center,
      color
    ),
    buildFace(
      [vertices[1], vertices[2], vertices[6], vertices[5]],
      center,
      color
    ),
    buildFace(
      [vertices[3], vertices[7], vertices[6], vertices[2]],
      center,
      color
    ),
    buildFace(
      [vertices[0], vertices[1], vertices[5], vertices[4]],
      center,
      color
    ),
  ];
}

function createPyramidFaces(
  center: Vec3,
  size: Vec3,
  color: string,
  direction: "front" | "back" | "up"
): Face[] {
  const halfX = size.x / 2;
  const halfY = size.y / 2;
  const halfZ = size.z / 2;

  if (direction === "front") {
    const base = [
      vector(-halfX, -halfY, -halfZ),
      vector(halfX, -halfY, -halfZ),
      vector(halfX, halfY, -halfZ),
      vector(-halfX, halfY, -halfZ),
    ];
    const tip = vector(0, 0, halfZ);

    return [
      buildFace([base[0], base[3], base[2], base[1]], center, color),
      buildFace([base[0], base[1], tip], center, color),
      buildFace([base[1], base[2], tip], center, color),
      buildFace([base[2], base[3], tip], center, color),
      buildFace([base[3], base[0], tip], center, color),
    ];
  }

  if (direction === "back") {
    const base = [
      vector(-halfX, -halfY, halfZ),
      vector(halfX, -halfY, halfZ),
      vector(halfX, halfY, halfZ),
      vector(-halfX, halfY, halfZ),
    ];
    const tip = vector(0, 0, -halfZ);

    return [
      buildFace([base[0], base[1], base[2], base[3]], center, color),
      buildFace([base[1], base[0], tip], center, color),
      buildFace([base[2], base[1], tip], center, color),
      buildFace([base[3], base[2], tip], center, color),
      buildFace([base[0], base[3], tip], center, color),
    ];
  }

  const base = [
    vector(-halfX, -halfY, -halfZ),
    vector(halfX, -halfY, -halfZ),
    vector(halfX, -halfY, halfZ),
    vector(-halfX, -halfY, halfZ),
  ];
  const tip = vector(0, halfY, 0);

  return [
    buildFace([base[0], base[1], base[2], base[3]], center, color),
    buildFace([base[1], base[0], tip], center, color),
    buildFace([base[2], base[1], tip], center, color),
    buildFace([base[3], base[2], tip], center, color),
    buildFace([base[0], base[3], tip], center, color),
  ];
}

function createGroundFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, -0.45, 0), vector(4.6, 1.1, 7.2), "#4d6659"),
    ...createBoxFaces(
      vector(-1.65, -0.86, 0),
      vector(0.75, 0.55, 7.6),
      "#2f3c34"
    ),
    ...createBoxFaces(
      vector(1.65, -0.86, 0),
      vector(0.75, 0.55, 7.6),
      "#2f3c34"
    ),
    ...createBoxFaces(vector(0, 0.3, -0.1), vector(2.45, 1.1, 2.8), "#809a87"),
    ...createBoxFaces(
      vector(0, 0.72, 2.65),
      vector(0.35, 0.35, 4.9),
      "#c3d9cd"
    ),
    ...createBoxFaces(
      vector(-0.92, 0.48, -1.05),
      vector(0.42, 0.42, 0.6),
      "#a4c8ba"
    ),
    ...createBoxFaces(
      vector(0.92, 0.48, -1.05),
      vector(0.42, 0.42, 0.6),
      "#a4c8ba"
    ),
  ];
}

function createFiresFaces(assetKind: AssetExperienceKind): Face[] {
  if (assetKind === "weapon") {
    return [
      ...createBoxFaces(vector(0, -0.1, 0), vector(0.7, 0.7, 7.2), "#d8dee7"),
      ...createPyramidFaces(
        vector(0, -0.1, 4.55),
        vector(0.8, 0.8, 1.9),
        "#ff9f63",
        "front"
      ),
      ...createPyramidFaces(
        vector(0, -0.1, -4.4),
        vector(0.55, 0.55, 1.2),
        "#7a8898",
        "back"
      ),
      ...createBoxFaces(
        vector(0, -0.7, -1.15),
        vector(2.6, 0.18, 2.2),
        "#586374"
      ),
      ...createBoxFaces(
        vector(0, -0.58, -1.15),
        vector(2.8, 0.12, 0.12),
        "#6de2ff"
      ),
      ...createBoxFaces(
        vector(0, -0.58, -2.05),
        vector(2.2, 0.12, 0.12),
        "#6de2ff"
      ),
    ];
  }

  return [
    ...createBoxFaces(
      vector(0, -0.62, -0.8),
      vector(3.8, 0.85, 6.4),
      "#59636f"
    ),
    ...createBoxFaces(
      vector(-1.3, -0.98, -0.8),
      vector(0.7, 0.45, 6.6),
      "#27313a"
    ),
    ...createBoxFaces(
      vector(1.3, -0.98, -0.8),
      vector(0.7, 0.45, 6.6),
      "#27313a"
    ),
    ...createBoxFaces(vector(0, 0.2, 1.15), vector(2.1, 1.2, 2), "#818d99"),
    ...createBoxFaces(vector(0, 0.96, -1.7), vector(2.8, 0.18, 4.4), "#adb9c6"),
    ...createBoxFaces(
      vector(-0.95, 1.2, -1.35),
      vector(0.4, 0.4, 3.3),
      "#ffb064"
    ),
    ...createBoxFaces(vector(0, 1.2, -1.35), vector(0.4, 0.4, 3.3), "#ffb064"),
    ...createBoxFaces(
      vector(0.95, 1.2, -1.35),
      vector(0.4, 0.4, 3.3),
      "#ffb064"
    ),
  ];
}

function createDefenseFaces(assetKind: AssetExperienceKind): Face[] {
  if (assetKind === "weapon") {
    return [
      ...createBoxFaces(vector(0, -0.6, 0), vector(3.6, 0.55, 4.6), "#55606a"),
      ...createBoxFaces(
        vector(0, 0.15, 0.2),
        vector(2.25, 1.05, 1.8),
        "#87929f"
      ),
      ...createBoxFaces(
        vector(-1.05, 1.15, -0.35),
        vector(0.55, 2.2, 0.55),
        "#c4d0db"
      ),
      ...createBoxFaces(
        vector(0, 1.15, -0.35),
        vector(0.55, 2.2, 0.55),
        "#c4d0db"
      ),
      ...createBoxFaces(
        vector(1.05, 1.15, -0.35),
        vector(0.55, 2.2, 0.55),
        "#c4d0db"
      ),
      ...createPyramidFaces(
        vector(0, 1.45, 1.6),
        vector(2.7, 0.55, 1.9),
        "#77f0ce",
        "up"
      ),
    ];
  }

  return [
    ...createBoxFaces(
      vector(0, -0.64, -0.15),
      vector(5.2, 0.45, 5.2),
      "#49535c"
    ),
    ...createBoxFaces(
      vector(-1.45, 0.05, -0.25),
      vector(1.8, 0.95, 1.9),
      "#748190"
    ),
    ...createBoxFaces(
      vector(1.35, 0.15, 0.2),
      vector(1.35, 1.2, 2.4),
      "#97a5b1"
    ),
    ...createBoxFaces(
      vector(0, 1.3, -0.95),
      vector(3.35, 0.22, 1.6),
      "#6fe7dc"
    ),
    ...createBoxFaces(vector(0, 0.6, 2.15), vector(0.45, 2.4, 0.45), "#d2dce7"),
    ...createBoxFaces(vector(0, 1.8, 2.15), vector(2.8, 0.22, 2.8), "#89d9ff"),
    ...createBoxFaces(
      vector(-1.2, 0.7, -2.1),
      vector(0.5, 1.7, 0.5),
      "#e8edf3"
    ),
    ...createBoxFaces(vector(0, 0.7, -2.1), vector(0.5, 1.7, 0.5), "#e8edf3"),
    ...createBoxFaces(vector(1.2, 0.7, -2.1), vector(0.5, 1.7, 0.5), "#e8edf3"),
  ];
}

function createMaritimeFaces(): Face[] {
  return [
    ...createBoxFaces(
      vector(0, -0.35, -0.2),
      vector(2.6, 1.15, 8.6),
      "#536b7f"
    ),
    ...createPyramidFaces(
      vector(0, -0.3, 5.05),
      vector(2.6, 1.08, 2.5),
      "#7890a8",
      "front"
    ),
    ...createPyramidFaces(
      vector(0, -0.3, -5.05),
      vector(1.45, 0.9, 1.8),
      "#41586c",
      "back"
    ),
    ...createBoxFaces(
      vector(0, 0.35, -0.95),
      vector(1.7, 1.15, 2.9),
      "#8ea2b5"
    ),
    ...createBoxFaces(vector(0, 1.1, -1.4), vector(1.05, 0.75, 1.2), "#bdccd8"),
    ...createBoxFaces(
      vector(0, 1.85, -1.2),
      vector(0.22, 1.45, 0.22),
      "#aac7dd"
    ),
    ...createBoxFaces(
      vector(0, 2.45, -1.1),
      vector(1.7, 0.24, 0.55),
      "#8ddcff"
    ),
    ...createBoxFaces(
      vector(-0.95, 0.18, 1.25),
      vector(0.4, 0.35, 1.55),
      "#a0b8cd"
    ),
    ...createBoxFaces(
      vector(0.95, 0.18, 1.25),
      vector(0.4, 0.35, 1.55),
      "#a0b8cd"
    ),
  ];
}

function createBaseFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, -0.82, 0), vector(8.8, 0.18, 12.8), "#474d54"),
    ...createBoxFaces(
      vector(-2.6, -0.25, -1.55),
      vector(2.8, 1.2, 2.6),
      "#7c8894"
    ),
    ...createPyramidFaces(
      vector(-2.6, 0.48, -1.55),
      vector(3, 1, 2.8),
      "#b4bfc9",
      "up"
    ),
    ...createBoxFaces(
      vector(2.55, 0.1, 2.35),
      vector(1.1, 1.8, 1.1),
      "#adb7c2"
    ),
    ...createBoxFaces(
      vector(2.55, 1.34, 2.35),
      vector(1.5, 0.42, 1.5),
      "#87d2ff"
    ),
    ...createBoxFaces(
      vector(0, -0.48, 3.05),
      vector(1.4, 0.06, 4.2),
      "#d1d7de"
    ),
    ...createBoxFaces(vector(0, -0.4, 3.05), vector(6.5, 0.04, 0.2), "#f2c567"),
    ...createBoxFaces(vector(0, -0.4, 1.55), vector(0.2, 0.04, 6.5), "#ffffff"),
  ];
}

function createScene(
  profile: ImmersiveExperienceProfile,
  assetKind: AssetExperienceKind
): SceneConfig {
  switch (profile) {
    case "ground":
      return {
        faces: createGroundFaces(),
        initialYaw: 0.7,
        initialPitch: -0.24,
        autoSpin: 0.0036,
        cameraDistance: 19,
        scale: 172,
        shadowWidth: 240,
        shadowHeight: 36,
        verticalOffset: 0.62,
      };
    case "fires":
      return {
        faces: createFiresFaces(assetKind),
        initialYaw: 0.58,
        initialPitch: -0.25,
        autoSpin: 0.0046,
        cameraDistance: 18,
        scale: 184,
        shadowWidth: 210,
        shadowHeight: 34,
        verticalOffset: 0.61,
      };
    case "defense":
      return {
        faces: createDefenseFaces(assetKind),
        initialYaw: 0.8,
        initialPitch: -0.3,
        autoSpin: 0.0032,
        cameraDistance: 20,
        scale: 172,
        shadowWidth: 225,
        shadowHeight: 36,
        verticalOffset: 0.6,
      };
    case "maritime":
      return {
        faces: createMaritimeFaces(),
        initialYaw: 0.64,
        initialPitch: -0.16,
        autoSpin: 0.0023,
        cameraDistance: 22,
        scale: 162,
        shadowWidth: 255,
        shadowHeight: 38,
        verticalOffset: 0.63,
      };
    case "base":
      return {
        faces: createBaseFaces(),
        initialYaw: 0.82,
        initialPitch: -0.34,
        autoSpin: 0.0015,
        cameraDistance: 26,
        scale: 144,
        shadowWidth: 280,
        shadowHeight: 42,
        verticalOffset: 0.62,
      };
  }
}

function rotatePoint(point: Vec3, yaw: number, pitch: number): Vec3 {
  const yawCos = Math.cos(yaw);
  const yawSin = Math.sin(yaw);
  const pitchCos = Math.cos(pitch);
  const pitchSin = Math.sin(pitch);
  const yawX = point.x * yawCos + point.z * yawSin;
  const yawZ = -point.x * yawSin + point.z * yawCos;
  const pitchY = point.y * pitchCos - yawZ * pitchSin;
  const pitchZ = point.y * pitchSin + yawZ * pitchCos;

  return vector(yawX, pitchY, pitchZ);
}

function calculateNormal(points: Vec3[]) {
  const [first, second, third] = points;
  const vectorA = vector(
    second.x - first.x,
    second.y - first.y,
    second.z - first.z
  );
  const vectorB = vector(
    third.x - first.x,
    third.y - first.y,
    third.z - first.z
  );

  return vector(
    vectorA.y * vectorB.z - vectorA.z * vectorB.y,
    vectorA.z * vectorB.x - vectorA.x * vectorB.z,
    vectorA.x * vectorB.y - vectorA.y * vectorB.x
  );
}

function normalizeVector(vectorValue: Vec3) {
  const length = Math.hypot(vectorValue.x, vectorValue.y, vectorValue.z) || 1;

  return vector(
    vectorValue.x / length,
    vectorValue.y / length,
    vectorValue.z / length
  );
}

function multiplyHexColor(hexColor: string, intensity: number, alpha = 1) {
  const normalizedColor = hexColor.replace("#", "");
  const red = parseInt(normalizedColor.slice(0, 2), 16);
  const green = parseInt(normalizedColor.slice(2, 4), 16);
  const blue = parseInt(normalizedColor.slice(4, 6), 16);

  return `rgba(${Math.round(red * intensity)}, ${Math.round(
    green * intensity
  )}, ${Math.round(blue * intensity)}, ${alpha})`;
}

function drawGroundBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string
) {
  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(34, 40, 28, 1)");
  background.addColorStop(0.45, "rgba(23, 29, 17, 1)");
  background.addColorStop(1, "rgba(8, 10, 7, 1)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.5,
    height * 0.56,
    0,
    width * 0.5,
    height * 0.56,
    width * 0.34
  );
  glow.addColorStop(0, multiplyHexColor(glowColor, 0.95, 0.18));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = multiplyHexColor(accentColor, 0.85, 0.18);
  context.lineWidth = 1;
  const horizonY = height * 0.66;
  for (let index = 0; index < 8; index += 1) {
    const ratio = (index + 1) / 8;
    const lineY = horizonY + ratio * ratio * height * 0.25;
    context.beginPath();
    context.moveTo(width * 0.1, lineY);
    context.lineTo(width * 0.9, lineY);
    context.stroke();
  }
  for (let index = -6; index <= 6; index += 1) {
    context.beginPath();
    context.moveTo(width * 0.5 + index * 30, horizonY);
    context.lineTo(width * 0.5 + index * 110, height);
    context.stroke();
  }
}

function drawFiresBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string
) {
  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(41, 22, 10, 1)");
  background.addColorStop(0.55, "rgba(16, 10, 8, 1)");
  background.addColorStop(1, "rgba(6, 5, 5, 1)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.54,
    height * 0.52,
    0,
    width * 0.54,
    height * 0.52,
    width * 0.38
  );
  glow.addColorStop(0, multiplyHexColor(glowColor, 1, 0.14));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = multiplyHexColor(accentColor, 1, 0.24);
  context.lineWidth = 1.2;
  [0.1, 0.18, 0.28].forEach((radiusRatio) => {
    context.beginPath();
    context.arc(
      width * 0.72,
      height * 0.3,
      width * radiusRatio,
      0,
      Math.PI * 2
    );
    context.stroke();
  });
  context.beginPath();
  context.moveTo(width * 0.2, height * 0.84);
  context.quadraticCurveTo(
    width * 0.45,
    height * 0.34,
    width * 0.76,
    height * 0.18
  );
  context.stroke();
}

function drawDefenseBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string,
  time: number
) {
  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(12, 28, 26, 1)");
  background.addColorStop(0.55, "rgba(7, 15, 16, 1)");
  background.addColorStop(1, "rgba(3, 7, 7, 1)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.52,
    height * 0.5,
    0,
    width * 0.52,
    height * 0.5,
    width * 0.42
  );
  glow.addColorStop(0, multiplyHexColor(glowColor, 1, 0.18));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = multiplyHexColor(accentColor, 1.08, 0.28);
  context.lineWidth = 1;
  [0.12, 0.2, 0.3, 0.42].forEach((radiusRatio) => {
    context.beginPath();
    context.arc(
      width * 0.5,
      height * 0.52,
      width * radiusRatio,
      0,
      Math.PI * 2
    );
    context.stroke();
  });

  const sweepAngle = time * 0.0015;
  context.save();
  context.translate(width * 0.5, height * 0.52);
  context.rotate(sweepAngle);
  const sweepGradient = context.createLinearGradient(0, 0, width * 0.38, 0);
  sweepGradient.addColorStop(0, multiplyHexColor(glowColor, 1.1, 0.28));
  sweepGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = sweepGradient;
  context.beginPath();
  context.moveTo(0, 0);
  context.arc(0, 0, width * 0.38, -0.18, 0.18);
  context.closePath();
  context.fill();
  context.restore();
}

function drawMaritimeBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string,
  time: number
) {
  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(10, 33, 47, 1)");
  background.addColorStop(0.5, "rgba(8, 19, 31, 1)");
  background.addColorStop(1, "rgba(4, 7, 11, 1)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.5,
    height * 0.42,
    0,
    width * 0.5,
    height * 0.42,
    width * 0.35
  );
  glow.addColorStop(0, multiplyHexColor(glowColor, 1, 0.16));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const horizonY = height * 0.58;
  context.strokeStyle = multiplyHexColor(accentColor, 0.98, 0.3);
  context.lineWidth = 1.4;
  context.beginPath();
  context.moveTo(width * 0.06, horizonY);
  context.lineTo(width * 0.94, horizonY);
  context.stroke();

  context.lineWidth = 1;
  for (let index = 0; index < 6; index += 1) {
    const waveY = horizonY + 28 + index * 26;
    context.beginPath();
    for (let x = 0; x <= width; x += 24) {
      const waveOffset = Math.sin(x * 0.018 + time * 0.002 + index) * 4;
      if (x === 0) {
        context.moveTo(x, waveY + waveOffset);
      } else {
        context.lineTo(x, waveY + waveOffset);
      }
    }
    context.stroke();
  }
}

function drawBaseBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string
) {
  const background = context.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, "rgba(32, 28, 20, 1)");
  background.addColorStop(0.46, "rgba(14, 12, 10, 1)");
  background.addColorStop(1, "rgba(6, 5, 5, 1)");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.5,
    height * 0.57,
    0,
    width * 0.5,
    height * 0.57,
    width * 0.36
  );
  glow.addColorStop(0, multiplyHexColor(glowColor, 1, 0.16));
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  context.strokeStyle = multiplyHexColor(accentColor, 1, 0.22);
  context.lineWidth = 1.2;
  const horizonY = height * 0.72;
  context.beginPath();
  context.moveTo(width * 0.44, horizonY);
  context.lineTo(width * 0.18, height);
  context.moveTo(width * 0.56, horizonY);
  context.lineTo(width * 0.82, height);
  context.stroke();

  for (let index = 0; index < 8; index += 1) {
    const ratio = (index + 1) / 8;
    const markerY = horizonY + ratio * ratio * height * 0.22;
    context.beginPath();
    context.moveTo(width * 0.485, markerY);
    context.lineTo(width * 0.515, markerY);
    context.stroke();
  }
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: ImmersiveExperienceProfile,
  accentColor: string,
  glowColor: string,
  time: number
) {
  switch (profile) {
    case "ground":
      drawGroundBackdrop(context, width, height, accentColor, glowColor);
      return;
    case "fires":
      drawFiresBackdrop(context, width, height, accentColor, glowColor);
      return;
    case "defense":
      drawDefenseBackdrop(context, width, height, accentColor, glowColor, time);
      return;
    case "maritime":
      drawMaritimeBackdrop(
        context,
        width,
        height,
        accentColor,
        glowColor,
        time
      );
      return;
    case "base":
      drawBaseBackdrop(context, width, height, accentColor, glowColor);
      return;
  }
}

function drawReticle(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string
) {
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  context.save();
  context.strokeStyle = multiplyHexColor(accentColor, 1.12, 0.6);
  context.lineWidth = 1.4;

  context.beginPath();
  context.moveTo(centerX - 22, centerY);
  context.lineTo(centerX - 7, centerY);
  context.moveTo(centerX + 7, centerY);
  context.lineTo(centerX + 22, centerY);
  context.moveTo(centerX, centerY - 22);
  context.lineTo(centerX, centerY - 7);
  context.moveTo(centerX, centerY + 7);
  context.lineTo(centerX, centerY + 22);
  context.stroke();

  context.beginPath();
  context.arc(centerX, centerY, 4, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

function drawActionEffect(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  profile: ImmersiveExperienceProfile,
  accentColor: string,
  glowColor: string,
  pulse: number
) {
  if (pulse <= 0.02) {
    return;
  }

  context.save();
  context.strokeStyle = multiplyHexColor(accentColor, 1.15, pulse * 0.85);
  context.fillStyle = multiplyHexColor(glowColor, 1, pulse * 0.16);
  context.lineWidth = 2;

  switch (profile) {
    case "ground":
      context.beginPath();
      context.moveTo(width * 0.5, height * 0.56);
      context.lineTo(width * 0.73, height * 0.44);
      context.stroke();
      break;
    case "fires":
      context.beginPath();
      context.moveTo(width * 0.46, height * 0.67);
      context.quadraticCurveTo(
        width * 0.56,
        height * 0.36,
        width * 0.76,
        height * 0.16
      );
      context.stroke();
      break;
    case "defense":
      context.beginPath();
      context.arc(
        width * 0.5,
        height * 0.5,
        width * (0.1 + pulse * 0.12),
        0,
        Math.PI * 2
      );
      context.stroke();
      break;
    case "maritime":
      context.beginPath();
      context.moveTo(width * 0.42, height * 0.65);
      context.lineTo(width * 0.32, height * 0.76);
      context.moveTo(width * 0.58, height * 0.65);
      context.lineTo(width * 0.68, height * 0.76);
      context.stroke();
      break;
    case "base":
      context.fillRect(
        width * 0.48,
        height * 0.56,
        width * 0.04,
        height * 0.28
      );
      break;
  }

  context.restore();
}

export default function ImmersiveAssetViewport({
  profile,
  assetKind,
  assetName,
  accentColor,
  glowColor,
}: Readonly<ImmersiveAssetViewportProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scene = createScene(profile, assetKind);
    const yawRef = { current: scene.initialYaw };
    const pitchRef = { current: scene.initialPitch };
    const zoomRef = { current: 1 };
    const driftXRef = { current: 0 };
    const driftYRef = { current: 0 };
    const draggingRef = { current: false };
    const pointerRef = { currentX: 0, currentY: 0 };
    const autoMotionRef = { current: true };
    const actionPulseRef = { current: 0 };
    const phaseRef = { current: 0 };
    let animationFrameId = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const devicePixelRatio = window.devicePixelRatio || 1;

      if (
        canvas.width !== width * devicePixelRatio ||
        canvas.height !== height * devicePixelRatio
      ) {
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
      }

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    };

    const resetView = () => {
      yawRef.current = scene.initialYaw;
      pitchRef.current = scene.initialPitch;
      zoomRef.current = 1;
      driftXRef.current = 0;
      driftYRef.current = 0;
      actionPulseRef.current = 0;
    };

    const handlePointerDown = (event: PointerEvent) => {
      draggingRef.current = true;
      pointerRef.currentX = event.clientX;
      pointerRef.currentY = event.clientY;
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current) return;

      const deltaX = event.clientX - pointerRef.currentX;
      const deltaY = event.clientY - pointerRef.currentY;
      pointerRef.currentX = event.clientX;
      pointerRef.currentY = event.clientY;

      yawRef.current += deltaX * 0.009;
      pitchRef.current = Math.max(
        -1.12,
        Math.min(0.82, pitchRef.current + deltaY * 0.008)
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      draggingRef.current = false;
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomRef.current = Math.max(
        0.7,
        Math.min(1.7, zoomRef.current - event.deltaY * 0.0009)
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "w":
          driftYRef.current = Math.max(-1.2, driftYRef.current - 0.08);
          break;
        case "s":
          driftYRef.current = Math.min(1.2, driftYRef.current + 0.08);
          break;
        case "a":
          yawRef.current -= 0.18;
          break;
        case "d":
          yawRef.current += 0.18;
          break;
        case "q":
          zoomRef.current = Math.max(0.7, zoomRef.current - 0.08);
          break;
        case "e":
          zoomRef.current = Math.min(1.7, zoomRef.current + 0.08);
          break;
        case "r":
          resetView();
          break;
        default:
          if (event.key === " ") {
            event.preventDefault();
            autoMotionRef.current = !autoMotionRef.current;
          } else if (event.key === "Enter") {
            actionPulseRef.current = 1;
          }
      }
    };

    const render = (time: number) => {
      resizeCanvas();

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      phaseRef.current += autoMotionRef.current ? 0.018 : 0.008;
      actionPulseRef.current = Math.max(0, actionPulseRef.current - 0.018);

      drawBackdrop(
        context,
        width,
        height,
        profile,
        accentColor,
        glowColor,
        time
      );

      const shadowGradient = context.createRadialGradient(
        width * 0.5,
        height * (scene.verticalOffset + 0.13),
        0,
        width * 0.5,
        height * (scene.verticalOffset + 0.13),
        scene.shadowWidth * 0.46
      );
      shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.42)");
      shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = shadowGradient;
      context.beginPath();
      context.ellipse(
        width * 0.5,
        height * (scene.verticalOffset + 0.13),
        scene.shadowWidth * 0.5,
        scene.shadowHeight * 0.5,
        0,
        0,
        Math.PI * 2
      );
      context.fill();

      const animatedYaw =
        autoMotionRef.current && !draggingRef.current
          ? yawRef.current + scene.autoSpin
          : yawRef.current;
      yawRef.current = animatedYaw;
      const animatedPitch =
        pitchRef.current +
        Math.sin(phaseRef.current) * 0.025 +
        driftYRef.current * 0.12;
      const lightDirection = normalizeVector(vector(-0.36, 0.72, -1));

      const rotatedFaces = scene.faces
        .map((face) => {
          const transformedPoints = face.points.map((point) =>
            rotatePoint(point, animatedYaw, animatedPitch)
          );
          const normal = normalizeVector(calculateNormal(transformedPoints));
          if (normal.z >= -0.01) {
            return null;
          }

          const depthAverage =
            transformedPoints.reduce((sum, point) => sum + point.z, 0) /
            transformedPoints.length;
          const brightness = Math.max(
            0.28,
            normal.x * lightDirection.x +
              normal.y * lightDirection.y +
              normal.z * lightDirection.z
          );

          const projectedPoints = transformedPoints.map((point) => {
            const depth = point.z + scene.cameraDistance;
            const factor = (scene.scale * zoomRef.current) / depth;

            return {
              x: width * 0.5 + point.x * factor + driftXRef.current * 24,
              y: height * scene.verticalOffset - point.y * factor,
            };
          });

          return {
            projectedPoints,
            depthAverage,
            faceColor: multiplyHexColor(face.color, brightness),
            strokeColor: multiplyHexColor(accentColor, 1.02, 0.7),
          };
        })
        .filter((face): face is NonNullable<typeof face> => face !== null)
        .sort((left, right) => right.depthAverage - left.depthAverage);

      rotatedFaces.forEach((face) => {
        context.beginPath();
        face.projectedPoints.forEach((point, index) => {
          if (index === 0) {
            context.moveTo(point.x, point.y);
          } else {
            context.lineTo(point.x, point.y);
          }
        });
        context.closePath();
        context.fillStyle = face.faceColor;
        context.fill();
        context.strokeStyle = face.strokeColor;
        context.lineWidth = 1;
        context.stroke();
      });

      drawActionEffect(
        context,
        width,
        height,
        profile,
        accentColor,
        glowColor,
        actionPulseRef.current
      );
      drawReticle(context, width, height, accentColor);

      animationFrameId = window.requestAnimationFrame(render);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    render(0);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [accentColor, assetKind, glowColor, profile]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
        aria-label={`${assetName} immersive viewport`}
        sx={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: "grab",
          "&:active": {
            cursor: "grabbing",
          },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          right: { xs: 14, md: 22 },
          bottom: { xs: 18, md: 24 },
          px: 1.6,
          py: 0.9,
          borderRadius: 999,
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "rgba(238, 247, 255, 0.82)",
          backgroundColor: "rgba(7, 14, 24, 0.66)",
          border: "1px solid rgba(153, 210, 255, 0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        Drag: Orbit / Wheel: Zoom / `WASD` `QE` `Space` `Enter` `R`
      </Box>
    </Box>
  );
}
