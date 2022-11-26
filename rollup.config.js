import commonjs from 'rollup-plugin-commonjs';
import globals from 'rollup-plugin-node-globals';
import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

const banner = `\
/**
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 *
 * @author ${pkg.author}
 * @license ${pkg.license}
 * @preserve
 */
`;

export default {
  // external: [
  //   '@turf/turf',
  //   'de9im',
  // ],
  input: pkg.main,
  output: [{
    banner: banner,
    file: `build/geospatial-index.js`,
    name: 'geospatial-index',
    format: 'es',
    sourcemap: true,
  }, {
    banner: banner,
    file: `build/geospatial-index.min.js`,
    format: 'es',
    name: 'geospatial-index',
    plugins: [terser()],
    sourcemap: true,
  }],
  plugins: [commonjs(), globals(), resolve(), terser()],
};
