import {exportModule} from 'src/index';
import {ModuleHandlers} from './model';

import Main from './views/Main';

export default exportModule('moduleC', ModuleHandlers, {Main});
