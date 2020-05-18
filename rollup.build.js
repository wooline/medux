import babel from 'rollup-plugin-babel';
import chalk from 'chalk';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

export default function (root, moduleName, globals, replaceNodeEnv) {
  const nodeEnv = process.env.NODE_ENV;
  const extensions = ['.js', '.ts', '.tsx'];
  const pkgResult = {include: {}, external: {}};
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(path.resolve(root, './package.json'));

  const externals = Object.keys(pkg.externals ? pkg.externals : Object.assign({}, pkg.dependencies, pkg.peerDependencies));
  const config = {
    input: 'src/',
    output:
      nodeEnv === 'production'
        ? [
            {file: 'dist/umd/index.min.js', format: 'umd', name: moduleName, globals, plugins: [terser()], sourcemap: true},
            {file: 'dist/cjs/index.min.js', format: 'cjs', plugins: [terser()], sourcemap: true},
          ]
        : [
            {file: 'dist/umd/index.js', format: 'umd', name: moduleName, globals},
            {file: 'dist/cjs/index.js', format: 'cjs'},
          ],
    external: (id) => {
      const hit = externals.some((mod) => mod === id || id.startsWith(mod + '/'));
      if (hit) {
        if (!pkgResult.external[id]) {
          pkgResult.external[id] = true;
          console.warn(chalk.red('external: '), id);
        }
      } else {
        if (!pkgResult.include[id]) {
          pkgResult.include[id] = true;
          console.warn(chalk.green('include: '), id);
        }
      }
      return hit;
    },
    plugins: [
      replaceNodeEnv && replace({'process.env.NODE_ENV': "'" + nodeEnv + "'"}),
      resolve({extensions}),
      babel({
        exclude: 'node_modules/**',
        extensions,
        runtimeHelpers: true,
        //externalHelpers: true,
      }),
      commonjs(),
    ].filter(Boolean),
  };
  return config;
}
