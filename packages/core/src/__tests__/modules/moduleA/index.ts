import {ModelHandlers, initModelState} from './model';

import Main from './views/Main';
import {exportModule} from '../../../index';

export default exportModule('moduleA', initModelState, ModelHandlers, {Main});
