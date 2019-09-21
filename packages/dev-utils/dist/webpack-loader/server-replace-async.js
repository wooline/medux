"use strict";
module.exports = function loader(source) {
    return source.replace(/import\s*\(/gm, 'require(');
};
