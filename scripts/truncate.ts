import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { db } from './db';

config();

async function truncate() {
    try {
        console.log('Truncating all tables...');

        await db().execute(sql`
            TRUNCATE TABLE users, accounts, graphs, nodes, edges CASCADE
        `);

        console.log('✅ All tables truncated successfully');
    } catch (error) {
        console.error('❌ Error truncating tables:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

truncate();
