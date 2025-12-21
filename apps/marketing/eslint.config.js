// @ts-check
import astroPlugin from 'eslint-plugin-astro'

export default [
  ...astroPlugin.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
]
