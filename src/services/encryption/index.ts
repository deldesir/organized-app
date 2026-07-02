import { AES, Utf8 } from 'crypto-es';

/**
 * Self-host encryption policy (deliberate — read before "fixing"):
 *
 * - Scalar encryptData/decryptData are REAL AES (crypto-es). They protect the
 *   congregation gates: the master key and access code are stored encrypted
 *   with themselves, so decrypting with a wrong passphrase THROWS and the
 *   onboarding screens genuinely reject wrong codes. (The previous stubs
 *   ignored the passphrase entirely — any input "verified".)
 *
 * - Object-level encryptObject/decryptObject are PASS-THROUGH. On this
 *   self-hosted deployment the congregation data intentionally stays
 *   server-readable: the local backend's query API (schedule webhooks, the
 *   assignment sync, reports) must be able to read schedules and persons.
 *   Upstream's per-field E2E map (TABLE_ENCRYPTION_MAP) would make the
 *   server blind and break those local integrations.
 */

export const generateKey = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => ('00' + b.toString(16)).slice(-2))
    .join('');
};

export const encryptData = (data: string, passphrase: string) => {
  data = JSON.stringify(data);
  const encryptedData = AES.encrypt(data, passphrase).toString();
  return encryptedData;
};

export const decryptData = (
  data: string,
  passphrase: string,
  field: string,
  table?: string
) => {
  try {
    const decryptedData = AES.decrypt(data, passphrase);
    const str = decryptedData.toString(Utf8);

    if (str.length === 0) {
      throw new Error('wrong passphrase');
    }

    const result: string = JSON.parse(str);
    return result;
  } catch (error) {
    let msg = 'An error occurred while decrypting';
    msg += ` ${field}`;

    if (table) {
      msg += ` in ${table}`;
    }

    throw new Error(`${msg}: ${(error as Error).message}`);
  }
};

export const encryptObject = <T extends object>(_args: {
  data: T;
  table: string;
  accessCode?: string;
  masterKey?: string;
}) => {
  // Pass-through by design — see the policy note at the top of this file.
};

export const decryptObject = <T extends object>(_args: {
  data: T;
  table: string;
  accessCode: string;
  masterKey?: string;
}) => {
  // Pass-through by design — see the policy note at the top of this file.
};
