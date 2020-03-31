import build from '../../rollup.build';

const config = build(__dirname, 'MeduxRWR', {
  history: 'History',
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
  'react-redux': 'ReactRedux',
});

export default config;
