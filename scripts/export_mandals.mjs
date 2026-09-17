import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../server/db.js';
import { initializeSeedData } from '../server/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

initializeSeedData(db);
const mandals = db.getAllMandals();

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const outFile = path.join(dataDir, 'mandals.json');
fs.writeFileSync(outFile, JSON.stringify(mandals, null, 2), 'utf-8');
console.log(`Exported ${mandals.length} mandals to ${outFile}`);
