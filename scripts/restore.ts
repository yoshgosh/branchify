import { config } from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

config();

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(), 'backups');

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

function listBackups(): string[] {
    if (!fs.existsSync(BACKUP_DIR)) {
        return [];
    }
    return fs
        .readdirSync(BACKUP_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .reverse();
}

async function restore() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('Error: DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    const backupFileName = process.argv[2];

    if (!backupFileName) {
        const backups = listBackups();

        if (backups.length === 0) {
            console.error('❌ No backup files found');
            console.log(`Backup directory: ${BACKUP_DIR}`);
            process.exit(1);
        }

        console.log('Available backup files:');
        backups.forEach((file, index) => {
            const filePath = path.join(BACKUP_DIR, file);
            const size = (fs.statSync(filePath).size / 1024).toFixed(2);
            console.log(`  ${index + 1}. ${file} (${size} KB)`);
        });
        console.log('');
        console.log('Usage: npm run db:restore <filename>');
        console.log('Example: npm run db:restore backup_20260123_120000.sql');
        process.exit(0);
    }

    const backupFilePath = path.isAbsolute(backupFileName)
        ? backupFileName
        : path.join(BACKUP_DIR, backupFileName);

    if (!fs.existsSync(backupFilePath)) {
        console.error(`❌ Backup file not found: ${backupFilePath}`);
        process.exit(1);
    }

    const { host, port, database, user, password } = parseConnectionString(connectionString);

    try {
        console.log(`Restoring database from ${backupFileName}...`);

        const env = { ...process.env, PGPASSWORD: password };

        // リストア前にデータを削除（外部キー制約の順序に注意）
        console.log('Clearing existing data...');
        const truncateCommand = `psql -h ${host} -p ${port} -U ${user} -d ${database} -c "TRUNCATE TABLE edges, nodes, graphs, accounts, users CASCADE;"`;
        await execAsync(truncateCommand, { env });

        // リストア実行
        const command = `psql -h ${host} -p ${port} -U ${user} -d ${database} -f "${backupFilePath}"`;

        await execAsync(command, { env });

        console.log('✅ Database restored successfully');
    } catch (error) {
        console.error('❌ Error restoring database:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

restore();
