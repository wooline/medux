if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cjs/index.min.js');
} else {
  module.exports = require('./dist/cjs/index.js');
}
