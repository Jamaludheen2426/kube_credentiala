import os from 'os';
import { WORKER_ID } from '../config/env';

export function getWorkerId(): string {
  if (WORKER_ID && WORKER_ID.trim() !== '') {
    return `worker-${WORKER_ID.trim()}`;
  }
  const host = os.hostname();
  const digits = host.match(/\d+/g)?.join('') ?? '1';
  const n = parseInt(digits.slice(-2) || '1', 10) || 1;
  return `worker-${n}`;
}
