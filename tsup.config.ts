import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm'],
    target: 'node22',
    platform: 'node',
    outDir: 'dist',
    clean: true,
    splitting: false,
    sourcemap: false,
    dts: false,
    skipNodeModulesBundle: false,
    noExternal: [/.*/],
    banner: {
        js: '#!/usr/bin/env node',
    },
});
