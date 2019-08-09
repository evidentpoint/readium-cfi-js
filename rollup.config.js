import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const pkg = require('./package.json');

const plugins = [
  babel(),
  resolve(),
  commonjs({
    // if false then skip sourceMap generation for CommonJS modules
    sourceMap: false, // Default: true
  }),
];

export default {
  input: 'src/index.js',
  output: [
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'umd',
      name: 'ReadiumCFI',
      globals: { jquery: '$' },
      sourcemap: true,
    },
  ],
  external: ['jquery'],
  plugins,
};
