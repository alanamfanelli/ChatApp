module.exports = {
  env: {
    browser: true,
    es2020: true,
    'react-native/react-native': true,
  },
  parser: 'babel-eslint',
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 11,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-native',
  ],
  rules: {
  },
};
