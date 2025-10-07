import fs from 'fs';
import path from 'path';
import { DATA_FILE } from '../config/env';
import { IssuedCredential } from '../models/types';

function ensureDataFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({ credentials: [] }, null, 2));
}

function readAll(filePath: string): { credentials: IssuedCredential[] } {
  ensureDataFile(filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(filePath: string, data: { credentials: IssuedCredential[] }) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

export const issuanceRepo = {
  getById: (credentialId: string, filePath: string = DATA_FILE): IssuedCredential | undefined => {
    const store = readAll(filePath);
    return store.credentials.find(c => c.credentialId === credentialId);
  },
  append: (record: IssuedCredential, filePath: string = DATA_FILE): void => {
    const store = readAll(filePath);
    store.credentials.push(record);
    writeAll(filePath, store);
  },
};
