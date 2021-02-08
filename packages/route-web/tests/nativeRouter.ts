const nativeRouter = {
  push(location: string, key: string, internal: boolean) {
    console.log('push', key);
  },
  replace(location: string, key: string, internal: boolean) {
    console.log('replace', key);
  },
  relaunch(location: string, key: string, internal: boolean) {
    console.log('relaunch', key);
  },
  back(location: string, n: number, key: string, internal: boolean) {
    console.log('back', n, key);
  },
  pop(location: string, n: number, key: string, internal: boolean) {
    console.log('pop', n, key);
  },
};

export default nativeRouter;
