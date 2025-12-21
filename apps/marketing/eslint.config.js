// @ts-check
import astroPlugin from 'eslint-plugin-astro'

export default [
  ...astroPlugin.configs.recommended,
  {
    rules: {
      'import/order': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
]
