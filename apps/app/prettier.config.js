//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  jsxSingleQuote: true,
  semi: false,
  trailingComma: 'es5',
  printWidth: 150,

  plugins: ['prettier-plugin-tailwindcss'],
}

export default config
