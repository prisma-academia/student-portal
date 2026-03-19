module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  plugins: ['react-refresh'],
  rules: {
    'react/jsx-no-target-blank': 'off',
    // This repo has multi-export files (layouts/router), so don't fail builds on this.
    'react-refresh/only-export-components': 'off',

    // Modern React (new JSX transform) + this codebase doesn't enforce PropTypes.
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react/no-children-prop': 'off',
    'react-hooks/exhaustive-deps': 'off',

    // This repo currently has many intentionally-unused imports/vars.
    'no-unused-vars': 'off',
  },
}
