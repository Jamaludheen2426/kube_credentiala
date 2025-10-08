import { canonicalStringify } from '../utils/canonical.js';
import { sha256Hex } from '../utils/hash.js';
import { getWorkerId } from '../utils/worker.js';
import { Credential } from '../models/types.js';
import { verificationRepo } from '../repositories/verificationRepo.js';
import { ISSUANCE_BASE_URL } from '../config/env.js';
import logger from '../logger/index.js';

export async function verifyCredential(credential: Credential): Promise<{ status: number; body: any }> {
  if (!ISSUANCE_BASE_URL) {
    return { status: 500, body: { error: 'missing_issuance_base_url' } };
  }
  const credentialId = sha256Hex(canonicalStringify(credential));
  try {
    const resp = await fetch(`${ISSUANCE_BASE_URL}/internal/issued/${credentialId}`);
    if (resp.status === 404) {
      const verifiedBy = getWorkerId();
      const verifiedAt = new Date().toISOString();
      verificationRepo.append({ credentialId, verifiedAt, verifiedBy, valid: false });
      logger.info('Verification failed (not issued): %s', credentialId);
      return { status: 404, body: { valid: false, reason: 'not_issued' } };
    }
    if (!resp.ok) {
      logger.warn('Issuance unavailable: %s', resp.status);
      return { status: 502, body: { error: 'issuance_unavailable' } };
    }
    const issued = await resp.json();
    const verifiedBy = getWorkerId();
    const verifiedAt = new Date().toISOString();
    verificationRepo.append({ credentialId, verifiedAt, verifiedBy, valid: true });
    logger.info('Verification success: %s', credentialId);
    return {
      status: 200,
      body: {
        valid: true,
        credentialId,
        issuedAt: issued.issuedAt,
        issuedBy: issued.issuedBy,
        verifiedBy,
        verifiedAt,
      },
    };
  } catch (e) {
    logger.error('Error contacting issuance: %s', (e as any)?.message || e);
    return { status: 502, body: { error: 'issuance_unavailable' } };
  }
}
