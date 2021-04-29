"use strict";

exports.__esModule = true;
exports.connectRedux = exports.createRedux = exports.Provider = void 0;

var _reactRedux = require("react-redux");

exports.Provider = _reactRedux.Provider;

var _withRedux = require("@medux/core/lib/with-redux");

exports.createRedux = _withRedux.createRedux;
var connectRedux = _reactRedux.connect;
exports.connectRedux = connectRedux;