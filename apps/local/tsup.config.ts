import { defineConfig } from 'tsup';

export default defineConfig(opts => ({
    clean: true,
    dts: true,
    entry: ['src/index.ts'],
    format: ['esm'],
    minify: !opts.watch,
    outDir: 'dist',
    sourcemap: true,
}));
