import { defineConfig } from 'tsup'

export default defineConfig({
	entry: ['src/index.ts'],
	format: ['esm'],
	target: 'es2022',
	external: ['react', 'react-dom'],
	dts: true,
	sourcemap: true,
	minify: true,
	splitting: false,
	clean: true,
})