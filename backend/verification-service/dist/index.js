import express from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
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
// JSON file persistence for verification logs
const dataFile = process.env.DATA_FILE || path.resolve(process.cwd(), 'data', 'verifications.json');
function ensureDataFile() {
    const dir = path.dirname(dataFile);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(dataFile))
        fs.writeFileSync(dataFile, JSON.stringify({ verifications: [] }, null, 2));
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
app.post('/verify', async (req, res) => {
    const parse = credentialSchema.safeParse(req.body);
    if (!parse.success || typeof req.body !== 'object' || Array.isArray(req.body) || req.body === null) {
        return res.status(400).json({ error: 'invalid_credential_json' });
    }
    const canonical = canonicalStringify(req.body);
    const credentialId = sha256Hex(canonical);
    const issuanceBase = process.env.ISSUANCE_BASE_URL;
    if (!issuanceBase)
        return res.status(500).json({ error: 'missing_issuance_base_url' });
    try {
        const resp = await fetch(`${issuanceBase}/internal/issued/${credentialId}`);
        if (resp.status === 404) {
            const verifiedBy = getWorkerId();
            const verifiedAt = new Date().toISOString();
            const store = readAll();
            store.verifications.push({ credentialId, verifiedAt, verifiedBy, valid: false });
            writeAll(store);
            return res.status(404).json({ valid: false, reason: 'not_issued' });
        }
        if (!resp.ok) {
            return res.status(502).json({ error: 'issuance_unavailable' });
        }
        const issued = await resp.json();
        const verifiedBy = getWorkerId();
        const verifiedAt = new Date().toISOString();
        const store = readAll();
        store.verifications.push({ credentialId, verifiedAt, verifiedBy, valid: true });
        writeAll(store);
        return res.json({
            valid: true,
            credentialId,
            issuedAt: issued.issuedAt,
            issuedBy: issued.issuedBy,
            verifiedBy,
            verifiedAt,
        });
    }
    catch (e) {
        return res.status(502).json({ error: 'issuance_unavailable' });
    }
});
export default app;
const port = parseInt(process.env.PORT || '3002', 10);
if (process.env.NODE_ENV !== 'test') {
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`Verification service listening on :${port}`);
    });
}
