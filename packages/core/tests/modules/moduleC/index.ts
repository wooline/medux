import {exportModule} from 'core/index';
import {ModelHandlers, initModelState} from './model';

import Main from './views/Main';

export default exportModule('moduleC', initModelState, ModelHandlers, {Main});
