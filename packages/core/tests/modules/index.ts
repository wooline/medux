import {getCoreAPP} from 'src/index';
import * as moduleA from './moduleA';
import * as moduleB from './moduleB';
import * as moduleC from './moduleC';

export const moduleGetter = {
  moduleA() {
    return moduleA;
  },
  moduleB() {
    return moduleB;
  },
  moduleC() {
    return moduleC;
  },
};
export const App = getCoreAPP();
