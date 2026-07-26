import { builtinModules } from 'node:module';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

const builtins = new Set([
    ...builtinModules,
    ...builtinModules.map((name) => `node:${name}`),
]);

export default [
    {
        input: 'src/main.ts',
        output: {
            file: 'dist/main.js',
            format: 'es',
            banner: '#!/usr/bin/env node',
        },
        plugins: [
            resolve({
                extensions: ['.ts', '.js', '.mjs', '.json'],
                browser: false,
                preferBuiltins: true,
                exportConditions: ['node', 'import', 'module', 'default'],
            }),
            json(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
            terser(),
        ],
        // Bundle third-party deps (e.g. @clack/prompts); keep Node built-ins external.
        external: (id) => builtins.has(id),
    },
];
