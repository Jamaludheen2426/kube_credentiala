import { Router } from 'express';
import { postVerify } from '../controllers/verificationController';

const router = Router();

router.get('/healthz', (_req, res) => res.json({ ok: true }));
router.post('/verify', postVerify);

export default router;
