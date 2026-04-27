import { createHmac, randomBytes } from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function fromBase32(encoded: string): Buffer {
  const cleaned = encoded.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function generateHOTP(secret: string, counter: number): string {
  const key = fromBase32(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter), 0);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24 |
      (hmac[offset + 1] & 0xff) << 16 |
      (hmac[offset + 2] & 0xff) << 8 |
      (hmac[offset + 3] & 0xff)) %
    1_000_000;
  return code.toString().padStart(6, '0');
}

export interface TOTPSecretResult {
  secret: string;
  qrCodeUrl: string;
}

export function generateTOTPSecret(
  account = 'admin',
  issuer = 'Admin Dashboard'
): TOTPSecretResult {
  const secret = toBase32(randomBytes(20));
  const qrCodeUrl = `otpauth://totp/${encodeURIComponent(
    issuer
  )}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(
    issuer
  )}`;
  return { secret, qrCodeUrl };
}

export function generateTOTPCode(
  secret: string,
  timestamp = Date.now()
): string {
  const counter = Math.floor(timestamp / 1000 / 30);
  return generateHOTP(secret, counter);
}

export function verifyTOTP(token: string, secret: string): boolean {
  const normalized = token.trim();
  if (!/^\d{6}$/.test(normalized)) return false;
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (let i = -1; i <= 1; i++) {
    if (generateHOTP(secret, counter + i) === normalized) {
      return true;
    }
  }
  return false;
}

export function generateBackupCodes(): string[] {
  return Array.from({ length: 10 }, () =>
    randomBytes(4).toString('hex').toUpperCase()
  );
}
