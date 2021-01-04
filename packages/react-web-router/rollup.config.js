import build from '../../rollup.build';

const config = build(__dirname, 'MeduxWeb', {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-redux': 'ReactRedux',
});

export default config;
