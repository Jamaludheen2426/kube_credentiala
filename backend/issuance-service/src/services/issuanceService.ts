import { issuanceRepo } from '../repositories/issuanceRepo.js';
import { canonicalStringify } from '../utils/canonical.js';
import { sha256Hex } from '../utils/hash.js';
import { getWorkerId } from '../utils/worker.js';
import { Credential, IssuedCredential } from '../models/types.js';
import logger from '../logger/index.js';

export function computeCredentialId(credential: Credential): string {
  return sha256Hex(canonicalStringify(credential));
}

export function issueCredential(credential: Credential): { status: number; body: any } {
  const credentialId = computeCredentialId(credential);
  const existing = issuanceRepo.getById(credentialId);
  if (existing) {
    logger.info('Credential already issued: %s', credentialId);
    return {
      status: 200,
      body: {
        message: 'credential already issued',
        credentialId,
        issuedAt: existing.issuedAt,
        issuedBy: existing.issuedBy,
      },
    };
  }
  const issuedBy = getWorkerId();
  const issuedAt = new Date().toISOString();
  const record: IssuedCredential = { credentialId, issuedAt, issuedBy };
  issuanceRepo.append(record);
  logger.info('Credential issued: %s by %s', credentialId, issuedBy);
  return {
    status: 201,
    body: {
      message: `credential issued by ${issuedBy}`,
      credentialId,
      issuedAt,
      issuedBy,
    },
  };
}

export function getIssuedById(credentialId: string): IssuedCredential | undefined {
  return issuanceRepo.getById(credentialId);
}
