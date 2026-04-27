import { describe, expect, it } from 'vitest';
import {
  generateTOTPSecret,
  verifyTOTP,
  generateBackupCodes,
  generateTOTPCode,
} from '../two-factor';

describe('two-factor', () => {
  describe('generateTOTPSecret', () => {
    it('returns a base32 secret and otpauth URL', () => {
      const result = generateTOTPSecret();
      expect(result.secret).toMatch(/^[A-Z2-7]+$/);
      expect(result.secret.length).toBeGreaterThanOrEqual(20);
      expect(result.qrCodeUrl).toContain('otpauth://totp/');
      expect(result.qrCodeUrl).toContain(`secret=${result.secret}`);
    });

    it('includes custom account and issuer in URL', () => {
      const result = generateTOTPSecret('user@example.com', 'My App');
      expect(result.qrCodeUrl).toContain(
        encodeURIComponent('user@example.com')
      );
      expect(result.qrCodeUrl).toContain(encodeURIComponent('My App'));
    });
  });

  describe('generateTOTPCode + verifyTOTP', () => {
    it('verifies a code generated for the current time window', () => {
      const { secret } = generateTOTPSecret();
      const code = generateTOTPCode(secret);
      expect(verifyTOTP(code, secret)).toBe(true);
    });

    it('rejects an invalid token', () => {
      const { secret } = generateTOTPSecret();
      expect(verifyTOTP('000000', secret)).toBe(false);
      expect(verifyTOTP('999999', secret)).toBe(false);
    });

    it('rejects non-6-digit tokens', () => {
      const { secret } = generateTOTPSecret();
      expect(verifyTOTP('12345', secret)).toBe(false);
      expect(verifyTOTP('1234567', secret)).toBe(false);
      expect(verifyTOTP('abcdef', secret)).toBe(false);
      expect(verifyTOTP('', secret)).toBe(false);
    });

    it('rejects empty or malformed secrets', () => {
      expect(verifyTOTP('123456', '')).toBe(false);
    });
  });

  describe('generateBackupCodes', () => {
    it('generates 10 codes', () => {
      const codes = generateBackupCodes();
      expect(codes).toHaveLength(10);
    });

    it('generates hex-like uppercase strings', () => {
      const codes = generateBackupCodes();
      for (const code of codes) {
        expect(code).toMatch(/^[0-9A-F]{8}$/);
      }
    });

    it('generates unique codes', () => {
      const codes = generateBackupCodes();
      const unique = new Set(codes);
      expect(unique.size).toBe(codes.length);
    });
  });
});
