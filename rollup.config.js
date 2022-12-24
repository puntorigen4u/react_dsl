import babel            from '@rollup/plugin-babel';
import { nodeResolve }  from '@rollup/plugin-node-resolve';
import copy             from 'rollup-plugin-copy-assets';
import json             from '@rollup/plugin-json';
//import compiler         from '@ampproject/rollup-plugin-closure-compiler';

const config = {
  input: 'src/index.js',
  external: [],
  output: {
    file: 'lib/index.js',
    format: 'umd',
    name: 'react_dsl',
    sourcemap: false
  },

  plugins: [
    nodeResolve(),
    json(),
    babel({
      presets: [
        ['@babel/preset-env',
        {
          targets: {
            esmodules: true,
          },
        }]
      ],
      exclude: '**/node_modules/**',
      babelHelpers: 'bundled',
    }),
    copy({
      assets: [
        'src/assets',
        'src/commands.js'
      ]
    }),
    //compiler()
  ]
};

export default config;