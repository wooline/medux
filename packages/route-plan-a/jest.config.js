module.exports = {
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // setupFiles: ['./test/setup.ts'],
  testURL: 'http://localhost/',
};
