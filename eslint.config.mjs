import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default [
	{ ignores: ['dist/**', '.test-build/**', 'node_modules/**'] },
	{
		files: ['src/**/*.{ts,tsx}'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		plugins: { 'react-hooks': reactHooks },
		rules: reactHooks.configs['recommended-latest'].rules,
	},
]
