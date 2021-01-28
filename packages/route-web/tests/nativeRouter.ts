import {NativeRouter} from 'src/index';

const nativeRouter: NativeRouter = {
  push(location, key) {
    console.log('push', key);
  },
  replace(location, key) {
    console.log('replace', key);
  },
  relaunch(location, key) {
    console.log('relaunch', key);
  },
  back(location, n, key) {
    console.log('back', n, key);
  },
  pop(location, n, key) {
    console.log('pop', n, key);
  },
};

export default nativeRouter;
