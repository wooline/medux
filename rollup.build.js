import babel from '@rollup/plugin-babel';
import chalk from 'chalk';
import commonjs from '@rollup/plugin-commonjs';
import path from 'path';
import replace from '@rollup/plugin-replace';
import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import alias from '@rollup/plugin-alias';

const tag = process.env.NODE_TAG || process.env.NODE_ENV;
const cfg = {
  next: {module: 'esm', outDir: 'next'},
  esm: {module: 'esm', outDir: 'esm'},
  cjs: {module: 'cjs', outDir: 'cjs'},
};
const env = cfg[tag];

export default function (root, replaceNodeEnv, aliasEntries) {
  const nodeEnv = process.env.NODE_ENV;
  const extensions = ['.js', '.ts', '.tsx'];
  const pkgResult = {include: {}, external: {}};
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = require(path.resolve(root, './package.json'));

  const externals = Object.keys(pkg.externals ? pkg.externals : {...pkg.dependencies, ...pkg.peerDependencies});
  const config = {
    input: 'src/',
    output: [{file: `dist/${env.outDir}/index.js`, format: env.module}].filter(Boolean),
    external: (id) => {
      const hit = externals.some((mod) => mod === id || id.startsWith(`${mod}/`));
      if (hit) {
        if (!pkgResult.external[id]) {
          pkgResult.external[id] = true;
          console.warn(chalk.red('external: '), id);
        }
      } else if (!pkgResult.include[id]) {
        pkgResult.include[id] = true;
        console.warn(chalk.green('include: '), id);
      }
      return hit;
    },
    plugins: [
      aliasEntries &&
        alias({
          entries: aliasEntries,
        }),
      replaceNodeEnv && replace({'process.env.NODE_ENV': `'${nodeEnv}'`}),
      resolve({extensions, mainFields: ['jsnext:main', 'module', 'main']}),
      babel({
        exclude: 'node_modules/**',
        extensions,
        babelHelpers: 'runtime',
        skipPreflightCheck: true,
        // externalHelpers: true,
      }),
      commonjs(),
    ].filter(Boolean),
  };
  return config;
}
