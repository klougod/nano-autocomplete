const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');
const replace = require('rollup-plugin-replace');
const resolve = require('rollup-plugin-node-resolve');
const pkg = require('./package.json');

export default [
  {
    input: 'src/index.js',
    output: {
      name: 'NanoAutocomplete',
      file: pkg.browser,
      format: 'iife',
      interop: false,
      strict: false
    },
    plugins: [
      resolve(),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser()
    ]
  },
  {
    input: 'src/index.js',
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' }
    ]
  }
];