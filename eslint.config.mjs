import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next';
import prettierConfig from 'eslint-config-prettier';

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
        rules: {
            // any の使用はエラーではなく警告に変更
            '@typescript-eslint/no-explicit-any': 'warn',
            // 未使用の引数はエラーではなく警告に変更、_で始まる引数、変数、エラーは無視
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
