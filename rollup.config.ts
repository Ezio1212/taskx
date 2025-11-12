import { defineConfig } from 'rollup'
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'

const isDev = process.env['NODE_ENV'] === 'development' || process.env['ROLLUP_WATCH'] === 'true';

export default defineConfig([
    {
        input: 'packages/taskx/index.ts',
        output: [
            {
                file: 'packages/taskx/index.esm.js',
                format: 'esm',
                sourcemap: isDev,
            },
            {
                file: 'packages/taskx/index.cjs.js',
                format: 'cjs',
                sourcemap: isDev,
            }
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript({
                declaration: false,
                declarationMap: false,
                tsconfig: './tsconfig.json',
                exclude: ['packages/example/**/*', '**/*.spec.ts', '**/*.test.ts']
            })
        ],
        external: []
    }, {
        input: 'packages/taskx/index.ts',
        output: {
            file: 'packages/taskx/index.d.ts',
            format: 'esm'
        },
        plugins: [
            dts({
                compilerOptions: {
                    baseUrl: '.',
                    paths: {
                        '*': ['packages/taskx/*']
                    }
                },
            }),
            typescript({
                declaration: false,
                declarationMap: false,
                tsconfig: './tsconfig.json',
                exclude: ['packages/example/**/*', '**/*.spec.ts', '**/*.test.ts']
            })
        ]
    }
]);