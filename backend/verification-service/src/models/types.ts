export type Credential = Record<string, unknown>;
export type VerificationLog = { credentialId: string; verifiedAt: string; verifiedBy: string; valid: boolean };
