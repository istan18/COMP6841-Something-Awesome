module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    settings: {
        react: {
            version: "detect",
        },
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "plugin:react/jsx-runtime",
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.{js,cjs}"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
            jsx: true,
        },
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "react"],
    rules: {
        indent: ["error", 4, { SwitchCase: 1 }],
        "linebreak-style": ["error", "unix"],
        quotes: ["error", "double"],
        semi: ["error", "always"],
        "@typescript-eslint/no-explicit-any": "off",
        // Add switch case indenting
    },
};