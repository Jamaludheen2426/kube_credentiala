import { Request, Response } from 'express';
import { z } from 'zod';
import { verifyCredential } from '../services/verificationService';

const credentialSchema = z.object({}).passthrough();

export async function postVerify(req: Request, res: Response) {
  const parsed = credentialSchema.safeParse(req.body);
  if (!parsed.success || typeof req.body !== 'object' || Array.isArray(req.body) || req.body === null) {
    return res.status(400).json({ error: 'invalid_credential_json' });
  }
  const result = await verifyCredential(parsed.data);
  return res.status(result.status).json(result.body);
}
