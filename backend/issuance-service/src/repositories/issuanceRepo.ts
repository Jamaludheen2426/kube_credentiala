import fs from 'fs';
import path from 'path';
import { DATA_FILE } from '../config/env.js';
import { IssuedCredential } from '../models/types.js';

// In-memory store as fallback when file system is not writable
let inMemoryStore: { credentials: IssuedCredential[] } | null = null;
let useFileSystem = true;

function ensureDataFile(filePath: string): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({ credentials: [] }, null, 2));
  } catch (e) {
    // If we can't write to filesystem, fall back to in-memory
    useFileSystem = false;
    if (!inMemoryStore) {
      inMemoryStore = { credentials: [] };
    }
  }
}

function readAll(filePath: string): { credentials: IssuedCredential[] } {
  if (!useFileSystem && inMemoryStore) {
    return inMemoryStore;
  }
  try {
    ensureDataFile(filePath);
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    // Fall back to in-memory
    useFileSystem = false;
    if (!inMemoryStore) {
      inMemoryStore = { credentials: [] };
    }
    return inMemoryStore;
  }
}

function writeAll(filePath: string, data: { credentials: IssuedCredential[] }) {
  if (!useFileSystem) {
    inMemoryStore = data;
    return;
  }
  try {
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, filePath);
  } catch (e) {
    // Fall back to in-memory
    useFileSystem = false;
    inMemoryStore = data;
  }
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
