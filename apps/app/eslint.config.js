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
    ignores: ['.output/**', 'dist/**', '*.config.js', '*.config.ts', 'prettier.config.js', 'vite.config.ts', 'routeTree.gen.ts'],
  },
]
