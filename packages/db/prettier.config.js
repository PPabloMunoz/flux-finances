//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: 'es5',
  printWidth: 150,

  plugins: ['@trivago/prettier-plugin-sort-imports'],
}

export default config
