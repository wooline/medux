import * as moduleA from './moduleA';
import * as moduleB from './moduleB';
import * as moduleC from './moduleC';

import {exportActions} from '../../index';

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
export const actions = exportActions(moduleGetter);
