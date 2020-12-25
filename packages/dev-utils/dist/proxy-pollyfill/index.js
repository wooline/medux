"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActions = void 0;
const path = require("path");
const TJS = require("typescript-json-schema");
const schema_utils_1 = require("schema-utils");
const schema = {
    type: 'object',
    properties: {
        tsconfig: {
            anyOf: [
                {
                    type: 'string',
                },
                {
                    type: 'object',
                },
            ],
        },
        entryFilePath: {
            type: 'string',
        },
        typeName: {
            type: 'string',
        },
    },
    additionalProperties: false,
};
function getActions(options = {}) {
    schema_utils_1.validate(schema, options, { name: '@medux/dev-utils/proxy-pollyfill' });
    const RootPath = process.cwd();
    let tsconfig;
    if (!options.tsconfig) {
        tsconfig = require(path.join(RootPath, './tsconfig.json'));
    }
    else if (typeof options.tsconfig === 'string') {
        tsconfig = require(options.tsconfig);
    }
    else {
        tsconfig = options.tsconfig;
    }
    const files = [options.entryFilePath || path.join(RootPath, 'src', 'Global.tsx')];
    const program = TJS.getProgramFromFiles(files, tsconfig.compilerOptions);
    const ExportActions = TJS.generateSchema(program, options.typeName || 'ExportActions', { ignoreErrors: false });
    console.log(JSON.stringify(ExportActions));
}
exports.getActions = getActions;
