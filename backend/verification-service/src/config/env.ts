import path from 'path';

export const PORT = parseInt(process.env.PORT || '3002', 10);
export const DATA_FILE = process.env.DATA_FILE || path.resolve(process.cwd(), 'data', 'verifications.json');
export const WORKER_ID = process.env.WORKER_ID || '';
export const ISSUANCE_BASE_URL = process.env.ISSUANCE_BASE_URL || '';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
