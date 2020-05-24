import build from '../../rollup.build';
import path from 'path';

const config = build(__dirname, null, {}, true, [
  {
    find: 'rn-host-detect',
    replacement: path.resolve(__dirname, 'src/rn-host-detect'),
  },
  {
    find: 'socketcluster-client',
    replacement: path.resolve(__dirname, 'src/socketcluster-client'),
  },
]);

export default config;
