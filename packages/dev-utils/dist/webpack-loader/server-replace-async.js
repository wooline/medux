"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const loader_utils_1 = __importDefault(require("loader-utils"));
const path_1 = __importDefault(require("path"));
const schema_utils_1 = __importDefault(require("schema-utils"));
const optionsType = {
    type: 'object',
    properties: {
        modules: {
            type: 'array',
        },
    },
};
const moduleIndexFile = path_1.default.join('src/modules/index');
module.exports = function loader(source) {
    if (this.resourcePath.indexOf(moduleIndexFile) > -1) {
        const options = loader_utils_1.default.getOptions(this);
        if (options) {
            schema_utils_1.default(optionsType, options, 'server-replace-async');
            const str = '(\\b(' + options.modules.join('|') + ')\\b[^,]+?)import\\s*\\(';
            const reg = new RegExp(str, 'gm');
            return source.replace(reg, '$1require(');
        }
        else {
            return source.replace(/import\s*\(/gm, 'require(');
        }
    }
    return source;
};
