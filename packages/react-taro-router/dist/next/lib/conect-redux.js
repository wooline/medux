import { connect } from 'react-redux';
export { Provider } from 'react-redux';
export const connectRedux = connect;
export function connectPage(page) {
  return connectRedux(appState => {
    return {
      pagename: appState.route.pagename
    };
  })(page);
}