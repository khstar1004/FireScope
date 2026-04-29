# Seungjin Offline Map Package

This package targets the Seungjin Firing Range area around Pocheon, Gyeonggi-do.

- Center: `127.354386, 38.07775`
- Bounds: `127.13,37.91,127.58,38.24`
- Intended radius: roughly 18-20 km around the range center

The checked-in files define the package contract. Generated tiles are not
checked in by default.

Expected generated data:

- `raster/basic/{z}/{x}/{y}.png`: optional 2D raster basemap
- `raster/satellite/{z}/{x}/{y}.jpg`: optional satellite imagery
- `terrain/terrarium/{z}/{x}/{y}.png`: Terrarium DEM tiles for MapLibre terrain
- `intel/*.geojson`: local OSM/VWorld-style overlay snapshots
- `cesium-terrain/`: optional Cesium terrain provider output

Run `node scripts/prepareSeungjinOfflineMap.mjs` from `client/` after installing
the optional tooling to populate local assets.
