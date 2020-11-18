import {exportModule} from 'src/index';
import {ModelHandlers} from './model';

import Main from './views/Main';

export default exportModule(ModelHandlers, {Main});
