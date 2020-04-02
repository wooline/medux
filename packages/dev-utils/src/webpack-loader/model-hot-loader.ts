export = function loader(source: string) {
  const arr = source.match(/export default exportModule\s*\((.+),\s*\{/m);
  if (arr) {
    return [
      `import {hotModelReplacement} from '@medux/core';`,
      source,
      `if (module.hot) {
      module.hot.accept('./model', () => {
        modelHotReplacement(${arr[1]});
      });
    }`,
    ].join('\r\n');
  }
  return source;
};
