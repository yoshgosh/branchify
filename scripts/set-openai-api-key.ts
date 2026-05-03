import { config } from 'dotenv';
import * as readline from 'readline';
import { eq } from 'drizzle-orm';
import { db, schema } from './db';

config();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
    const users = await db().select().from(schema.users);

    if (users.length === 0) {
        console.error('❌ No users found');
        process.exit(1);
    }

    console.log('\nUsers:');
    users.forEach((u, i) => {
        const keyStatus = u.openaiApiKey ? '✅ key set' : '❌ no key';
        console.log(`  ${i + 1}. ${u.name} <${u.email}> [${keyStatus}]`);
    });
    console.log();

    const numStr = await question('Select user number: ');
    const num = parseInt(numStr, 10);

    if (isNaN(num) || num < 1 || num > users.length) {
        console.error('❌ Invalid selection');
        process.exit(1);
    }

    const user = users[num - 1];
    console.log(`\nSelected: ${user.name} <${user.email}>`);

    const apiKey = await question('Enter OpenAI API key (sk-...): ');

    if (!apiKey.trim()) {
        console.error('❌ API key cannot be empty');
        process.exit(1);
    }

    rl.close();

    await db()
        .update(schema.users)
        .set({ openaiApiKey: apiKey.trim() })
        .where(eq(schema.users.userId, user.userId));

    console.log(`\n✅ OpenAI API key set for ${user.name}`);
}

main()
    .catch((err) => {
        console.error('❌ Error:', err);
        process.exit(1);
    })
    .finally(() => process.exit(0));
