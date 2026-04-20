import { defineConfig } from 'vite';
import cesium from 'vite-plugin-cesium';

export default defineConfig(({ command }) => ({
	base: command === 'build' ? '/flight-sim/' : '/',
	plugins: [cesium()]
}));
