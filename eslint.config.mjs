import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([
        '.next/',
        'out/',
        'build/',
        'dist/',
        'node_modules/',
        'drizzle/',
        'backups/',
        'next-env.d.ts',
    ]),
    ...nextConfig,
    prettierConfig,
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],
        },
    },
]);
