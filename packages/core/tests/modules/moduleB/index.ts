import {exportModule} from 'src/index';
import {ModelHandlers, initModelState} from './model';

import Main from './views/Main';

export default exportModule('moduleB', initModelState, ModelHandlers, {Main});