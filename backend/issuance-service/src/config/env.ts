import path from 'path';

export const PORT = parseInt(process.env.PORT || '3001', 10);
export const DATA_FILE = process.env.DATA_FILE || path.resolve(process.cwd(), 'data', 'credentials.json');
export const WORKER_ID = process.env.WORKER_ID || '';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
