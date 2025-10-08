import fs from 'fs';
import path from 'path';
import { DATA_FILE } from '../config/env.js';
import { VerificationLog } from '../models/types.js';

function ensureDataFile(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({ verifications: [] }, null, 2));
}

function readAll(filePath: string): { verifications: VerificationLog[] } {
  ensureDataFile(filePath);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeAll(filePath: string, data: { verifications: VerificationLog[] }) {
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

export const verificationRepo = {
  append: (record: VerificationLog, filePath: string = DATA_FILE): void => {
    const store = readAll(filePath);
    store.verifications.push(record);
    writeAll(filePath, store);
  },
};
