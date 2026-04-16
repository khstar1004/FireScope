import { UnitDbSnapshot } from "@/game/db/unitDbSnapshot";

export interface PythonUnitDbSnapshot extends UnitDbSnapshot {
  metadata: {
    sourceFile: string;
    generatedAt: string;
    availableDomains: Record<keyof UnitDbSnapshot, boolean>;
  };
}
