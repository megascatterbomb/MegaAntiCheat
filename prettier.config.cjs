/** @typedef  {import("@ianvs/prettier-plugin-sort-imports").PluginConfig} SortImportsConfig*/
/** @typedef  {import("prettier").Config} PrettierConfig*/
/** @typedef  {{ tailwindConfig: string }} TailwindConfig*/

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    arrowParens: 'avoid',
    printWidth: 80,
    singleQuote: true,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: 'all',
    tabWidth: 4,
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
    ],
    importOrder: [
        '^(react/(.*)$)|^(react$)|^(react-native(.*)$)',
        '^(next/(.*)$)|^(next$)',
        '^(expo(.*)$)|^(expo$)',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@megaanticheat/(.*)$',
        '',
        '^~/utils/(.*)$',
        '^~/components/(.*)$',
        '^~/styles/(.*)$',
        '^~/(.*)$',
        '^[./]',
    ],
    importOrderSeparation: false,
    importOrderSortSpecifiers: true,
    importOrderBuiltinModulesToTop: true,
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderMergeDuplicateImports: true,
    importOrderCombineTypeAndValueImports: true,
};

module.exports = config;
