import { connect } from 'react-redux';
export { Provider } from 'react-redux';
export var connectRedux = connect;
export function connectPage(page) {
  return connectRedux(function (appState) {
    return {
      pagename: appState.route.pagename
    };
  })(page);
}