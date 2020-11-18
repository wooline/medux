export = function loader(source: string) {
  const arr = source.match(/export default exportModule\s*\(([^)]+)\)/m);
  if (arr) {
    const args = arr[1].replace(/\s/gm, '');
    const [modelName, ModelHandlers] = args.split(',', 3);
    const views = args.replace([modelName, ModelHandlers, ''].join(','), '');
    const viewPaths = source.match(/['"]\.\/views\/.*['"]/gm) || [];
    const strs = [
      `import {modelHotReplacement} from '@medux/core';`,
      `import {viewHotReplacement} from '@medux/core';`,
      source,
      `if (module.hot) {
      module.hot.accept("./model", () => {
        modelHotReplacement(${[modelName, ModelHandlers].join(' , ')});
      });
      module.hot.accept([${viewPaths.toString()}], () => {
        viewHotReplacement(${[modelName, views].join(' , ')});
      });
      }`,
    ];
    return strs.join('\r\n');
  }
  return source;
};
