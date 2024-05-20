import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: './src/cli/index.ts',
    output: {
      file: './dist/cli.js',
      format: 'esm',
      sourcemap: true,
    },
    external: [/node_modules/, 'tslib'],
    plugins: [
      resolve({
        extensions: ['.ts']
      }),
      commonjs(),
      typescript(),
    ]
  }
]