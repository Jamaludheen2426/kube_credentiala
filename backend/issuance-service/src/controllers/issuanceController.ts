import { Request, Response } from 'express';
import { z } from 'zod';
import { issueCredential, getIssuedById } from '../services/issuanceService';
import logger from '../logger';

const credentialSchema = z.object({}).passthrough();

export async function postIssue(req: Request, res: Response) {
  const parsed = credentialSchema.safeParse(req.body);
  if (!parsed.success || typeof req.body !== 'object' || Array.isArray(req.body) || req.body === null) {
    return res.status(400).json({ error: 'invalid_credential_json' });
  }
  const result = issueCredential(parsed.data);
  return res.status(result.status).json(result.body);
}

export async function getInternalIssued(req: Request, res: Response) {
  const { credentialId } = req.params;
  const existing = getIssuedById(credentialId);
  if (!existing) {
    logger.info('Internal lookup: not found %s', credentialId);
    return res.status(404).json({ error: 'not_found' });
  }
  return res.json(existing);
}
