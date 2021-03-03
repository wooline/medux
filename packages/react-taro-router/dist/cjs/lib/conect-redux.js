"use strict";

exports.__esModule = true;
exports.connectPage = connectPage;
exports.connectRedux = exports.Provider = void 0;

var _reactRedux = require("react-redux");

exports.Provider = _reactRedux.Provider;
var connectRedux = _reactRedux.connect;
exports.connectRedux = connectRedux;

function connectPage(page) {
  return connectRedux(function (appState) {
    return {
      pagename: appState.route.pagename
    };
  })(page);
}