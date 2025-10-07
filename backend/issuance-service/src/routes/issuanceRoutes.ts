import { Router } from 'express';
import { postIssue, getInternalIssued } from '../controllers/issuanceController';

const router = Router();

router.get('/healthz', (_req, res) => res.json({ ok: true }));
router.post('/issue', postIssue);
router.get('/internal/issued/:credentialId', getInternalIssued);

export default router;
