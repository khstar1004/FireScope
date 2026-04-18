import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import type { AssetExperienceKind } from "@/gui/experience/assetExperience";

interface AssetExperienceViewerProps {
  kind: AssetExperienceKind;
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
    buildFace([vertices[0], vertices[3], vertices[2], vertices[1]], center, color),
    buildFace([vertices[4], vertices[5], vertices[6], vertices[7]], center, color),
    buildFace([vertices[0], vertices[4], vertices[7], vertices[3]], center, color),
    buildFace([vertices[1], vertices[2], vertices[6], vertices[5]], center, color),
    buildFace([vertices[3], vertices[7], vertices[6], vertices[2]], center, color),
    buildFace([vertices[0], vertices[1], vertices[5], vertices[4]], center, color),
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

function createAircraftFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, 0, 0), vector(0.85, 0.7, 6.4), "#7f90aa"),
    ...createPyramidFaces(vector(0, 0, 4.1), vector(0.9, 0.8, 2), "#a5bfdc", "front"),
    ...createPyramidFaces(vector(0, 0, -4.1), vector(0.5, 0.4, 1.6), "#5a6d84", "back"),
    ...createBoxFaces(vector(0, 0, -0.25), vector(6.4, 0.12, 2.1), "#425a78"),
    ...createBoxFaces(vector(0, 0.2, 1.15), vector(0.8, 0.26, 1.5), "#75d8ff"),
    ...createBoxFaces(vector(0, 0.05, -3.3), vector(2.8, 0.08, 1), "#52657c"),
    ...createBoxFaces(vector(-0.55, 0.85, -3.1), vector(0.18, 1.1, 1.3), "#8fa5c0"),
    ...createBoxFaces(vector(0.55, 0.85, -3.1), vector(0.18, 1.1, 1.3), "#8fa5c0"),
  ];
}

function createShipFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, -0.35, -0.2), vector(2.2, 1.1, 8.1), "#536b7f"),
    ...createPyramidFaces(vector(0, -0.3, 4.8), vector(2.2, 1.05, 2.2), "#778ea5", "front"),
    ...createPyramidFaces(vector(0, -0.3, -4.7), vector(1.3, 0.9, 1.6), "#41576b", "back"),
    ...createBoxFaces(vector(0, 0.3, -0.85), vector(1.45, 0.9, 2.5), "#8da0b2"),
    ...createBoxFaces(vector(0, 0.95, -1.3), vector(0.95, 0.75, 1.2), "#b5c3d2"),
    ...createBoxFaces(vector(0, 1.55, -1.2), vector(0.22, 1.2, 0.22), "#aac7dd"),
    ...createBoxFaces(vector(0, 2.05, -1.1), vector(1.4, 0.25, 0.45), "#7eb7db"),
    ...createBoxFaces(vector(-0.8, 0.15, 1.2), vector(0.35, 0.35, 1.4), "#9ab2c8"),
    ...createBoxFaces(vector(0.8, 0.15, 1.2), vector(0.35, 0.35, 1.4), "#9ab2c8"),
  ];
}

function createWeaponFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, 0, 0), vector(0.55, 0.55, 6.5), "#d0d6df"),
    ...createPyramidFaces(vector(0, 0, 4.15), vector(0.6, 0.6, 1.8), "#ff9a52", "front"),
    ...createPyramidFaces(vector(0, 0, -4.05), vector(0.45, 0.45, 1.1), "#748498", "back"),
    ...createBoxFaces(vector(0, 0, -1.6), vector(2.1, 0.08, 1.2), "#6dd7ff"),
    ...createBoxFaces(vector(0, 0, -1.6), vector(0.08, 2.1, 1.2), "#6dd7ff"),
    ...createBoxFaces(vector(0, 0, 0.6), vector(1.3, 0.05, 0.6), "#a4b0be"),
  ];
}

function createFacilityFaces(): Face[] {
  return [
    ...createBoxFaces(vector(0, -0.55, 0), vector(5.2, 0.45, 4.2), "#5d6874"),
    ...createBoxFaces(vector(-1.25, 0.25, -0.6), vector(1.7, 1.2, 1.6), "#8da0b2"),
    ...createBoxFaces(vector(-1.15, 1.2, -0.45), vector(0.28, 1.35, 2.15), "#7cd7ff"),
    ...createBoxFaces(vector(1.55, 0.2, 0.25), vector(1.75, 0.85, 2.25), "#9aa8b7"),
    ...createBoxFaces(vector(1.55, 0.9, 0.25), vector(1.95, 0.2, 2.3), "#d7e6f5"),
    ...createBoxFaces(vector(0.55, 0.05, -1.25), vector(0.75, 0.75, 0.75), "#b9cad9"),
  ];
}

function createAirbaseFaces(): Face[] {
  const runwaySegments = [-7.2, -3.6, 0, 3.6, 7.2].flatMap((zOffset) =>
    createBoxFaces(
      vector(0, -0.72, zOffset),
      vector(0.52, 0.03, 1.7),
      "#f0c469"
    )
  );

  return [
    ...createBoxFaces(vector(0, -1.05, 0), vector(3.2, 0.12, 17.8), "#485057"),
    ...createBoxFaces(vector(-3.75, -1.03, 0.25), vector(3.4, 0.1, 8.6), "#596269"),
    ...createBoxFaces(vector(3.65, -1.03, 0.1), vector(2.9, 0.1, 6.8), "#596269"),
    ...runwaySegments,
    ...createBoxFaces(vector(-4.15, -0.42, -3.5), vector(2.7, 1.05, 2.5), "#77838d"),
    ...createPyramidFaces(vector(-4.15, 0.18, -3.5), vector(2.9, 0.9, 2.7), "#b9c4ce", "up"),
    ...createBoxFaces(vector(-4.2, -0.45, 3.1), vector(2.9, 1, 2.8), "#6f7d88"),
    ...createPyramidFaces(vector(-4.2, 0.12, 3.1), vector(3.1, 0.95, 3), "#afbac5", "up"),
    ...createBoxFaces(vector(4.45, -0.18, -1.7), vector(0.72, 2.4, 0.72), "#9ca8b3"),
    ...createBoxFaces(vector(4.45, 1.18, -1.7), vector(1.25, 0.34, 1.25), "#88d2ff"),
    ...createBoxFaces(vector(3.5, -0.55, 1.65), vector(1.8, 0.72, 2.15), "#8f9daa"),
    ...createBoxFaces(vector(3.5, -0.03, 1.65), vector(1.95, 0.14, 2.25), "#d8e2ec"),
    ...createBoxFaces(vector(2.45, -0.67, 5.15), vector(1.9, 0.42, 1.55), "#c0ccd8"),
    ...createBoxFaces(vector(4.65, -0.67, 5.15), vector(1.9, 0.42, 1.55), "#c0ccd8"),
  ];
}

function createScene(kind: AssetExperienceKind): SceneConfig {
  switch (kind) {
    case "aircraft":
      return {
        faces: createAircraftFaces(),
        initialYaw: 0.65,
        initialPitch: -0.28,
        autoSpin: 0.0045,
        cameraDistance: 16,
        scale: 185,
        shadowWidth: 165,
        shadowHeight: 28,
      };
    case "ship":
      return {
        faces: createShipFaces(),
        initialYaw: 0.7,
        initialPitch: -0.18,
        autoSpin: 0.0024,
        cameraDistance: 20,
        scale: 160,
        shadowWidth: 210,
        shadowHeight: 34,
      };
    case "weapon":
      return {
        faces: createWeaponFaces(),
        initialYaw: 0.55,
        initialPitch: -0.22,
        autoSpin: 0.0056,
        cameraDistance: 14,
        scale: 195,
        shadowWidth: 150,
        shadowHeight: 24,
      };
    case "facility":
      return {
        faces: createFacilityFaces(),
        initialYaw: 0.72,
        initialPitch: -0.3,
        autoSpin: 0.0022,
        cameraDistance: 20,
        scale: 162,
        shadowWidth: 220,
        shadowHeight: 34,
      };
    case "airbase":
      return {
        faces: createAirbaseFaces(),
        initialYaw: 0.64,
        initialPitch: -0.31,
        autoSpin: 0.0015,
        cameraDistance: 15.5,
        scale: 210,
        shadowWidth: 280,
        shadowHeight: 44,
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
  const first = points[0];
  const second = points[1];
  const third = points[2];
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

  const scaledRed = Math.max(0, Math.min(255, Math.round(red * intensity)));
  const scaledGreen = Math.max(
    0,
    Math.min(255, Math.round(green * intensity))
  );
  const scaledBlue = Math.max(0, Math.min(255, Math.round(blue * intensity)));

  return `rgba(${scaledRed}, ${scaledGreen}, ${scaledBlue}, ${alpha})`;
}

function drawBackdrop(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string,
  glowColor: string
) {
  const backgroundGradient = context.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, "rgba(6, 11, 22, 0.98)");
  backgroundGradient.addColorStop(0.55, "rgba(11, 23, 37, 0.98)");
  backgroundGradient.addColorStop(1, "rgba(4, 6, 10, 1)");

  context.fillStyle = backgroundGradient;
  context.fillRect(0, 0, width, height);

  const radialGlow = context.createRadialGradient(
    width * 0.52,
    height * 0.48,
    0,
    width * 0.52,
    height * 0.48,
    Math.min(width, height) * 0.42
  );
  radialGlow.addColorStop(0, multiplyHexColor(glowColor, 1, 0.16));
  radialGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
  context.fillStyle = radialGlow;
  context.fillRect(0, 0, width, height);

  context.save();
  context.strokeStyle = multiplyHexColor(accentColor, 0.9, 0.2);
  context.lineWidth = 1;

  const horizonY = height * 0.58;
  for (let index = 1; index <= 8; index += 1) {
    const ratio = index / 8;
    const lineY = horizonY + ratio * ratio * height * 0.28;
    context.beginPath();
    context.moveTo(width * 0.18, lineY);
    context.lineTo(width * 0.82, lineY);
    context.stroke();
  }

  for (let index = -5; index <= 5; index += 1) {
    const baseX = width / 2 + index * 48;
    context.beginPath();
    context.moveTo(baseX, horizonY);
    context.lineTo(width / 2 + index * 145, height * 0.98);
    context.stroke();
  }

  context.restore();

  context.save();
  context.strokeStyle = multiplyHexColor(accentColor, 1.05, 0.3);
  context.lineWidth = 1.2;

  [0.16, 0.27, 0.39].forEach((radiusRatio) => {
    context.beginPath();
    context.arc(width * 0.5, height * 0.47, width * radiusRatio, 0, Math.PI * 2);
    context.stroke();
  });

  context.beginPath();
  context.moveTo(width * 0.1, height * 0.47);
  context.lineTo(width * 0.9, height * 0.47);
  context.stroke();

  context.beginPath();
  context.moveTo(width * 0.5, height * 0.08);
  context.lineTo(width * 0.5, height * 0.86);
  context.stroke();
  context.restore();
}

function drawReticle(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string
) {
  const centerX = width * 0.5;
  const centerY = height * 0.47;

  context.save();
  context.strokeStyle = multiplyHexColor(accentColor, 1.15, 0.55);
  context.lineWidth = 1.4;

  context.beginPath();
  context.moveTo(centerX - 18, centerY);
  context.lineTo(centerX - 6, centerY);
  context.moveTo(centerX + 6, centerY);
  context.lineTo(centerX + 18, centerY);
  context.moveTo(centerX, centerY - 18);
  context.lineTo(centerX, centerY - 6);
  context.moveTo(centerX, centerY + 6);
  context.lineTo(centerX, centerY + 18);
  context.stroke();

  context.beginPath();
  context.arc(centerX, centerY, 3.5, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

export default function AssetExperienceViewer({
  kind,
  accentColor,
  glowColor,
}: Readonly<AssetExperienceViewerProps>) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const scene = createScene(kind);
    const yawRef = { current: scene.initialYaw };
    const pitchRef = { current: scene.initialPitch };
    const zoomRef = { current: 1 };
    const draggingRef = { current: false };
    const pointerRef = { currentX: 0, currentY: 0 };
    let animationFrameId = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(rect.width));
      const nextHeight = Math.max(1, Math.round(rect.height));
      const devicePixelRatio = window.devicePixelRatio || 1;

      if (
        canvas.width !== nextWidth * devicePixelRatio ||
        canvas.height !== nextHeight * devicePixelRatio
      ) {
        canvas.width = nextWidth * devicePixelRatio;
        canvas.height = nextHeight * devicePixelRatio;
      }

      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
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

      yawRef.current += deltaX * 0.01;
      pitchRef.current = Math.max(
        -1.15,
        Math.min(0.8, pitchRef.current + deltaY * 0.008)
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
        0.72,
        Math.min(1.55, zoomRef.current - event.deltaY * 0.0009)
      );
    };

    const render = () => {
      resizeCanvas();

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      drawBackdrop(context, width, height, accentColor, glowColor);

      const shadowGradient = context.createRadialGradient(
        width * 0.5,
        height * 0.66,
        0,
        width * 0.5,
        height * 0.66,
        scene.shadowWidth * 0.72
      );
      shadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.34)");
      shadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = shadowGradient;
      context.beginPath();
      context.ellipse(
        width * 0.5,
        height * 0.66,
        scene.shadowWidth * 0.5,
        scene.shadowHeight * 0.5,
        0,
        0,
        Math.PI * 2
      );
      context.fill();

      const rotatedFaces = scene.faces
        .map((face) => {
          const transformedPoints = face.points.map((point) =>
            rotatePoint(point, yawRef.current, pitchRef.current)
          );
          const normal = normalizeVector(calculateNormal(transformedPoints));
          if (normal.z >= -0.01) return null;

          const depthAverage =
            transformedPoints.reduce((sum, point) => sum + point.z, 0) /
            transformedPoints.length;

          const lightDirection = normalizeVector(vector(-0.28, 0.74, -1));
          const brightness = Math.max(
            0.3,
            normal.x * lightDirection.x +
              normal.y * lightDirection.y +
              normal.z * lightDirection.z
          );

          const projectedPoints = transformedPoints.map((point) => {
            const depth = point.z + scene.cameraDistance;
            const factor = (scene.scale * zoomRef.current) / depth;

            return {
              x: width * 0.5 + point.x * factor,
              y: height * 0.47 - point.y * factor,
            };
          });

          return {
            projectedPoints,
            depthAverage,
            faceColor: multiplyHexColor(face.color, brightness),
            strokeColor: multiplyHexColor(accentColor, 1.02, 0.75),
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

      drawReticle(context, width, height, accentColor);

      if (!draggingRef.current) {
        yawRef.current += scene.autoSpin;
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerUp);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerUp);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [accentColor, glowColor, kind]);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: 360, md: 520 },
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid rgba(135, 190, 255, 0.18)",
        background:
          "linear-gradient(180deg, rgba(9, 16, 28, 0.96), rgba(5, 10, 18, 0.98))",
        boxShadow: "0 28px 80px rgba(0, 0, 0, 0.45)",
      }}
    >
      <Box
        component="canvas"
        ref={canvasRef}
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
          right: 16,
          bottom: 16,
          px: 1.5,
          py: 0.75,
          borderRadius: 999,
          fontSize: 12,
          letterSpacing: "0.08em",
          color: "rgba(226, 240, 255, 0.78)",
          backgroundColor: "rgba(8, 16, 28, 0.72)",
          border: "1px solid rgba(135, 190, 255, 0.16)",
          backdropFilter: "blur(10px)",
        }}
      >
        Drag: 회전 / Wheel: 확대
      </Box>
    </Box>
  );
}
