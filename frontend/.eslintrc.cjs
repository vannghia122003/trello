module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended',
		'plugin:import/typescript',
		'plugin:@typescript-eslint/recommended',
		'plugin:@tanstack/eslint-plugin-query/recommended',
		// Disable các rule mà eslint xung đột với prettier.
		// Để cái này ở dưới để nó override các rule phía trên!.
		'eslint-config-prettier',
		'prettier'
	],
	ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts'],
	parser: '@typescript-eslint/parser',
	plugins: [
		'react-refresh',
		'react',
		'@typescript-eslint',
		'import',
		'jsx-a11y',
		'react-hooks',
		'prettier'
	],
	settings: {
		react: {
			version: 'detect'
		},
		// Nói ESLint cách xử lý các import
		'import/resolver': {
			node: {
				paths: ['src'],
				extensions: ['.js', '.jsx', '.ts', '.tsx']
			}
		}
	},
	rules: {
		/* React */
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'react/jsx-no-target-blank': 'warn',

		/* MUI */
		'no-restricted-imports': [
			'error',
			{
				patterns: ['@mui/*/*/*']
			}
		],

		/* Common */
		'prettier/prettier': [
			'warn',
			{
				arrowParens: 'always',
				bracketSameLine: false,
				bracketSpacing: true,
				semi: false,
				singleQuote: true,
				jsxSingleQuote: false,
				quoteProps: 'as-needed',
				trailingComma: 'none',
				singleAttributePerLine: false,
				htmlWhitespaceSensitivity: 'css',
				vueIndentScriptAndStyle: false,
				proseWrap: 'preserve',
				insertPragma: false,
				printWidth: 120,
				requirePragma: false,
				tabWidth: 2,
				useTabs: false,
				embeddedLanguageFormatting: 'auto',
				endOfLine: 'auto'
			}
		]
	}
}
