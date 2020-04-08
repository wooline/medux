import {ModelHandlers, initModelState} from './model';

import Main from './views/Main';
import {exportModule} from '../../../index';

export default exportModule('moduleB', initModelState, ModelHandlers, {Main});
