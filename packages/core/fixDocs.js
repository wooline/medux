const replace = require('replace-in-file');
const options = {
  files: 'api/**/*.md',
  from: /<(\w+)>/g,
  to: '&lt;$1&gt;',
  countMatches: true,
};
const results = replace.sync(options);
const changedFiles = results.filter((result) => result.hasChanged);
console.log('Replacement results:', changedFiles);
