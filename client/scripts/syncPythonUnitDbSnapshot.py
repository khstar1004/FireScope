from __future__ import annotations

import ast
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE_FILE = ROOT / "gym" / "blade" / "db" / "UnitDb.py"
OUTPUT_FILE = ROOT / "client" / "src" / "game" / "db" / "pythonUnitDbSnapshot.json"


def load_python_tables() -> dict[str, list[dict[str, object]]]:
    module = ast.parse(SOURCE_FILE.read_text(encoding="utf-8"), filename=str(SOURCE_FILE))
    table_names = {"AircraftDb", "AirbaseDb", "FacilityDb", "ShipDb"}
    tables: dict[str, list[dict[str, object]]] = {}

    for statement in module.body:
        if not isinstance(statement, ast.Assign):
            continue
        if len(statement.targets) != 1 or not isinstance(statement.targets[0], ast.Name):
            continue

        table_name = statement.targets[0].id
        if table_name not in table_names:
            continue

        tables[table_name] = ast.literal_eval(statement.value)

    missing_tables = table_names - tables.keys()
    if missing_tables:
        missing_text = ", ".join(sorted(missing_tables))
        raise RuntimeError(f"Missing Python unit DB tables: {missing_text}")

    return tables


def normalize_aircraft_db(records: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized_records = []
    for record in records:
        data_source = record.get("data_source", {})
        units = record.get("units", {})
        normalized_records.append(
            {
                "className": record["class_name"],
                "speed": record["speed"],
                "maxFuel": record["max_fuel"],
                "fuelRate": record["fuel_rate"],
                "range": record["range"],
                "dataSource": {
                    "speedSrc": data_source.get("speed_src", ""),
                    "maxFuelSrc": data_source.get("max_fuel_src", ""),
                    "fuelRateSrc": data_source.get("fuel_rate_src", ""),
                    "rangeSrc": data_source.get("range_src", ""),
                },
                "units": {
                    "speedUnit": units.get("speed_unit", ""),
                    "maxFuelUnit": units.get("max_fuel_unit", ""),
                    "fuelRateUnit": units.get("fuel_rate_unit", ""),
                    "rangeUnit": units.get("range_unit", ""),
                },
            }
        )
    return normalized_records


def normalize_airbase_db(records: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            "name": record["name"],
            "latitude": record["latitude"],
            "longitude": record["longitude"],
            "country": record["country"],
        }
        for record in records
    ]


def normalize_facility_db(records: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            "className": record["class_name"],
            "range": record["range"],
        }
        for record in records
    ]


def normalize_ship_db(records: list[dict[str, object]]) -> list[dict[str, object]]:
    return [
        {
            "className": record["class_name"],
            "speed": record["speed"],
            "maxFuel": record["max_fuel"],
            "fuelRate": record["fuel_rate"],
            "range": record["range"],
            "units": {
                "speedUnit": "mph",
                "maxFuelUnit": "lbs",
                "fuelRateUnit": "lbs/hr",
                "rangeUnit": "nm",
            },
        }
        for record in records
    ]


def build_snapshot() -> dict[str, object]:
    tables = load_python_tables()

    return {
        "metadata": {
            "sourceFile": "gym/blade/db/UnitDb.py",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "availableDomains": {
                "airbaseDb": True,
                "aircraftDb": True,
                "facilityDb": True,
                "shipDb": True,
                "weaponDb": False,
            },
        },
        "airbaseDb": normalize_airbase_db(tables["AirbaseDb"]),
        "aircraftDb": normalize_aircraft_db(tables["AircraftDb"]),
        "facilityDb": normalize_facility_db(tables["FacilityDb"]),
        "shipDb": normalize_ship_db(tables["ShipDb"]),
        "weaponDb": [],
    }


def main() -> None:
    snapshot = build_snapshot()
    OUTPUT_FILE.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {OUTPUT_FILE.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
