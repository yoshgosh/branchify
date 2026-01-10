import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = [
    {
        ignores: [
            '.next/',
            'out/',
            'build/',
            'dist/',
            'node_modules/',
            'drizzle/',
            'public/',
            '*.config.*',
            'next-env.d.ts',
        ],
    },
    ...nextConfig,
    prettierConfig,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
];

export default eslintConfig;
