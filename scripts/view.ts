import { config } from 'dotenv';
import { db, schema } from './db';

config();

async function viewData() {
    const tableName = process.argv[2];

    try {
        if (!tableName) {
            console.log('📊 All tables data:\n');

            const users = await db().select().from(schema.users);
            console.log('🔴 Users:', JSON.stringify(users, null, 2));
            console.log();

            const accounts = await db().select().from(schema.accounts);
            console.log('🟣 Accounts:', JSON.stringify(accounts, null, 2));
            console.log();

            const graphs = await db().select().from(schema.graphs);
            console.log('🟠 Graphs:', JSON.stringify(graphs, null, 2));
            console.log();

            const nodes = await db().select().from(schema.nodes);
            console.log('🔵 Nodes:', JSON.stringify(nodes, null, 2));
            console.log();

            const edges = await db().select().from(schema.edges);
            console.log('🟢Edges:', JSON.stringify(edges, null, 2));
        } else {
            switch (tableName) {
                case 'users':
                    const users = await db().select().from(schema.users);
                    console.log(JSON.stringify(users, null, 2));
                    break;
                case 'accounts':
                    const accounts = await db().select().from(schema.accounts);
                    console.log(JSON.stringify(accounts, null, 2));
                    break;
                case 'graphs':
                    const graphs = await db().select().from(schema.graphs);
                    console.log(JSON.stringify(graphs, null, 2));
                    break;
                case 'nodes':
                    const nodes = await db().select().from(schema.nodes);
                    console.log(JSON.stringify(nodes, null, 2));
                    break;
                case 'edges':
                    const edges = await db().select().from(schema.edges);
                    console.log(JSON.stringify(edges, null, 2));
                    break;
                default:
                    console.error(`❌ Unknown table: ${tableName}`);
                    console.log('Available tables: users, accounts, graphs, nodes, edges');
                    process.exit(1);
            }
        }
    } catch (error) {
        console.error('❌ Error viewing data:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

viewData();
