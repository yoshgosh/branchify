import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

config();

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), 'backups');

function getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function parseConnectionString(connectionString: string) {
    const url = new URL(connectionString);
    return {
        host: url.hostname,
        port: url.port || '5432',
        database: url.pathname.slice(1),
        user: url.username,
        password: url.password,
    };
}

async function backup() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('Error: DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const { host, port, database, user, password } = parseConnectionString(connectionString);
    const timestamp = getTimestamp();
    const backupFileName = `backup_${timestamp}.sql`;
    const backupFilePath = path.join(BACKUP_DIR, backupFileName);

    try {
        console.log('Creating database backup...');

        const env = { ...process.env, PGPASSWORD: password };
        // --data-only でデータのみをバックアップ、--inserts でINSERT文形式
        const command = `pg_dump -h ${host} -p ${port} -U ${user} -d ${database} --no-owner --no-acl --data-only --inserts -F p`;

        const { stdout } = await execAsync(command, { env });
        fs.writeFileSync(backupFilePath, stdout);

        const size = (fs.statSync(backupFilePath).size / 1024).toFixed(2);
        console.log(`✅ Backup created successfully: ${backupFileName} (${size} KB)`);
    } catch (error) {
        console.error('❌ Error creating backup:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

backup();
