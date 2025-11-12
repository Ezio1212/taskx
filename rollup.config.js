import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import del from 'rollup-plugin-delete';
import terser from '@rollup/plugin-terser';

// 检查是否在开发模式（通过环境变量或 watch 模式判断）
const isDev = process.env.NODE_ENV === 'development' || process.env.ROLLUP_WATCH === 'true';

export default defineConfig([
  {
    input: 'src/index.ts',
    watch: {
      include: 'src/**',
      exclude: 'node_modules/**',
      clearScreen: false,
      buildDelay: 300,
    },
    output: [
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: isDev
      },
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: isDev,
        exports: 'named'
      }
    ],
    plugins: [
      del({ 
        targets: 'dist/*',
        runOnce: true
      }),
      nodeResolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationMap: false
      }),
      // 仅在生产环境中压缩代码
      !isDev && terser()
    ].filter(Boolean) // 过滤掉 false 值
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [
      dts({
        compilerOptions: {
          baseUrl: './src'
        }
      })
    ]
  }
]);