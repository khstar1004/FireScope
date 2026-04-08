import * as Cesium from 'cesium';

export function movePosition(lon, lat, alt, heading, pitch, distance) {
	const headingRad = Cesium.Math.toRadians(heading);
	const pitchRad = Cesium.Math.toRadians(pitch);

	const R = 6371000;

	const dLat = (distance * Math.cos(headingRad) * Math.cos(pitchRad)) / R;
	const dLon = (distance * Math.sin(headingRad) * Math.cos(pitchRad)) / (R * Math.cos(Cesium.Math.toRadians(lat)));
	const dAlt = distance * Math.sin(pitchRad);

	return {
		lon: lon + Cesium.Math.toDegrees(dLon),
		lat: lat + Cesium.Math.toDegrees(dLat),
		alt: alt + dAlt
	};
}

export function movePositionByVector(lon, lat, alt, heading, forwardDistance, rightDistance, upDistance = 0) {
	const headingRad = Cesium.Math.toRadians(heading);
	const latRad = Cesium.Math.toRadians(lat);
	const R = 6371000;

	const northDistance =
		(Math.cos(headingRad) * forwardDistance) -
		(Math.sin(headingRad) * rightDistance);
	const eastDistance =
		(Math.sin(headingRad) * forwardDistance) +
		(Math.cos(headingRad) * rightDistance);

	const dLat = northDistance / R;
	const dLon = eastDistance / (R * Math.cos(latRad));

	return {
		lon: lon + Cesium.Math.toDegrees(dLon),
		lat: lat + Cesium.Math.toDegrees(dLat),
		alt: alt + upDistance
	};
}
