/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: 'es5',
  printWidth: 150,

  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  importOrder: ['^react$', '^react/', '<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '^@/', '^[./]'],
}

export default config
