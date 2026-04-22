import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';

export default [
    {
        input: 'src/main.ts',
        output: {
            file: 'dist/main.js',
            format: 'es',
            banner: '#!/usr/bin/env node'
        },
        plugins: [
            resolve({ extensions: ['.ts', '.js', '.json'] }),
            json(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' }),
            terser()
        ],
        external: ['inquirer']
    }
]
