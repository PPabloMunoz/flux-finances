//  @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'import/order': 'off',
    },
  },
  {
    ignores: ['*.config.js', '*.config.ts', 'prettier.config.js'],
  },
]
