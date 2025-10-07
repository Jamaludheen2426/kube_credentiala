import express from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
// Utility: canonical JSON stringify (stable key order)
function canonicalStringify(value) {
    const sorter = (a, b) => a[0].localeCompare(b[0]);
    const seen = new WeakSet();
    const stringify = (val) => {
        if (val === null || typeof val !== 'object')
            return val;
        if (seen.has(val))
            throw new Error('Circular refs not supported');
        seen.add(val);
        if (Array.isArray(val))
            return val.map(stringify);
        return Object.fromEntries(Object.entries(val).sort(sorter).map(([k, v]) => [k, stringify(v)]));
    };
    return JSON.stringify(stringify(value));
}
function sha256Hex(input) {
    return createHash('sha256').update(input).digest('hex');
}
function getWorkerId() {
    if (process.env.WORKER_ID && process.env.WORKER_ID.trim() !== '') {
        return `worker-${process.env.WORKER_ID.trim()}`;
    }
    const host = os.hostname();
    const digits = host.match(/\d+/g)?.join('') ?? '1';
    const n = parseInt(digits.slice(-2) || '1', 10) || 1;
    return `worker-${n}`;
}
// Simple JSON file persistence
const dataFile = process.env.DATA_FILE || path.resolve(process.cwd(), 'data', 'credentials.json');
function ensureDataFile() {
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dataFile))
        fs.writeFileSync(dataFile, JSON.stringify({ credentials: [] }, null, 2));
}
function readAll() {
    ensureDataFile();
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(raw);
}
function writeAll(data) {
    const tmp = dataFile + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, dataFile);
}
const app = express();
app.use(express.json({ limit: '1mb' }));
const credentialSchema = z.object({}).passthrough();
app.get('/healthz', (_, res) => {
    res.json({ ok: true });
});
app.post('/issue', (req, res) => {
    const parse = credentialSchema.safeParse(req.body);
    if (!parse.success || typeof req.body !== 'object' || Array.isArray(req.body) || req.body === null) {
        return res.status(400).json({ error: 'invalid_credential_json' });
    }
    const canonical = canonicalStringify(req.body);
    const credentialId = sha256Hex(canonical);
    const store = readAll();
    const existing = store.credentials.find(c => c.credentialId === credentialId);
    if (existing) {
        return res.status(200).json({
            message: 'credential already issued',
            credentialId,
            issuedAt: existing.issuedAt,
            issuedBy: existing.issuedBy,
        });
    }
    const issuedBy = getWorkerId();
    const issuedAt = new Date().toISOString();
    store.credentials.push({ credentialId, issuedAt, issuedBy });
    writeAll(store);
    return res.status(201).json({
        message: `credential issued by ${issuedBy}`,
        credentialId,
        issuedAt,
        issuedBy,
    });
});
// Internal endpoint for verification service
app.get('/internal/issued/:credentialId', (req, res) => {
    const { credentialId } = req.params;
    const store = readAll();
    const existing = store.credentials.find(c => c.credentialId === credentialId);
    if (!existing)
        return res.status(404).json({ error: 'not_found' });
    return res.json(existing);
});
export default app;
const port = parseInt(process.env.PORT || '3001', 10);
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Issuance service listening on :${port}`);
    });
}
