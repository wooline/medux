"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const moduleIndexFile = path_1.default.join('src/modules/index');
module.exports = function loader(source) {
    if (this.resourcePath.indexOf(moduleIndexFile) > -1) {
        return source.replace(/import\s*\(/gm, 'require(');
    }
    return source;
};
