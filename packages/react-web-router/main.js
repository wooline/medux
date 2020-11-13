if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/esm/index.min.js');
} else {
  module.exports = require('./dist/esm/index.js');
}
