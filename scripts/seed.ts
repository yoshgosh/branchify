import { config } from 'dotenv';
import { db, schema } from './db';

config();

async function seedUser() {
    const userId = process.env.DEV_USER_ID;

    if (!userId) {
        console.error('Error: DEV_USER_ID environment variable is not set');
        process.exit(1);
    }

    try {
        const [user] = await db()
            .insert(schema.users)
            .values({
                userId,
                name: 'Test User',
            })
            .returning();

        console.log('✅ User seeded successfully:');
        console.log(user);
    } catch (error) {
        console.error('❌ Error seeding user:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

seedUser();
