import build from '../../rollup.build';

const config = build(__dirname, 'MeduxWeb', {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-dom/server': 'ReactDOMServer',
});

export default config;
