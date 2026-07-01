import fs from 'fs/promises';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'db.json');

export async function getDb() {
  const fileContents = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(fileContents);
}

export async function saveDb(data) {
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
}
