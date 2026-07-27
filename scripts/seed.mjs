/**
 * Resets the demo restaurant. Run between sales demos so the next owner sees
 * "Order #1" rather than order #47 from the previous meeting.
 *
 * The app also seeds itself on first boot when the database is empty — see
 * lib/seed.mjs. This script differs in that it deliberately wipes and rebuilds.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from '../lib/schema.mjs';
import { seedDemo, DEMO_SLUG, DEMO_TABLES } from '../lib/seed.mjs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'qrmenu.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.exec(SCHEMA_SQL);

const id = seedDemo(db, { reset: true });
const itemCount = db.prepare('SELECT COUNT(*) AS n FROM items WHERE restaurant_id = ?').get(id).n;

console.log(`\n  Seeded "${DEMO_SLUG}" — ${itemCount} menu items, ${DEMO_TABLES.length} tables.`);
console.log(`  Database: ${DB_PATH}`);
console.log(`\n  Guest menu  : http://localhost:3000/m/${DEMO_SLUG}/1`);
console.log(`  Staff board : http://localhost:3000/staff   (PIN 1234)`);
console.log(`  Owner admin : http://localhost:3000/admin    (PIN 1234)\n`);
