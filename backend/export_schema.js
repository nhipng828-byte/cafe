require('dotenv').config();
const db = require('./config/db');

async function exportFullSchema() {
    try {
        const [tables] = await db.query('SHOW TABLES');
        // Object keys vary, so get the first property value which is the table name
        const keyName = Object.keys(tables[0])[0];
        
        console.log('-- ======================================================');
        console.log('-- LUX CAFÉ MANAGEMENT SYSTEM - FULL DATABASE SCHEMA');
        console.log('-- Generated: ' + new Date().toLocaleString('vi-VN'));
        console.log('-- ======================================================\n');

        for (let t of tables) {
            const tableName = t[keyName];
            const [createSql] = await db.query(`SHOW CREATE TABLE ${tableName}`);
            console.log(`-- Table: ${tableName}`);
            console.log(createSql[0]['Create Table'] + ';\n');
        }
        process.exit();
    } catch (err) {
        console.error('Lỗi khi trích xuất schema:', err);
        process.exit(1);
    }
}

exportFullSchema();
