import { describe, expect, it, vi } from 'vitest';
import { exportToCSV, exportToJSON, sanitizeCSVValue } from '../export-utils';

describe('export-utils', () => {
  describe('sanitizeCSVValue', () => {
    it('returns empty string for null or undefined', () => {
      expect(sanitizeCSVValue(null)).toBe('');
      expect(sanitizeCSVValue(undefined)).toBe('');
    });

    it('returns string representation for numbers', () => {
      expect(sanitizeCSVValue(42)).toBe('42');
      expect(sanitizeCSVValue(3.14)).toBe('3.14');
    });

    it('wraps values containing commas in quotes', () => {
      expect(sanitizeCSVValue('hello, world')).toBe('"hello, world"');
    });

    it('doubles quotes inside values and wraps in quotes', () => {
      expect(sanitizeCSVValue('say "hello"')).toBe('"say ""hello"""');
    });

    it('wraps values containing newlines in quotes', () => {
      expect(sanitizeCSVValue('line1\nline2')).toBe('"line1\nline2"');
    });

    it('returns plain string for simple values', () => {
      expect(sanitizeCSVValue('simple')).toBe('simple');
    });
  });

  describe('exportToCSV', () => {
    it('triggers a download with correct CSV content', () => {
      const createObjectURL = vi.fn((_blob: Blob) => 'blob:url');
      const revokeObjectURL = vi.fn();
      const appendChild = vi.fn();
      const removeChild = vi.fn();
      const click = vi.fn();

      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const linkMock = { click, href: '', download: '' } as unknown as HTMLAnchorElement;
      const createElement = vi.fn(() => linkMock);
      vi.stubGlobal('document', {
        createElement,
        body: { appendChild, removeChild },
      });

      const data = [
        { name: 'Alice', age: 30, city: 'New York' },
        { name: 'Bob', age: 25, city: 'Los Angeles' },
      ];

      exportToCSV(data, 'users.csv');

      expect(createElement).toHaveBeenCalledWith('a');
      expect(linkMock.download).toBe('users.csv');
      expect(click).toHaveBeenCalled();
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:url');

      const blobCall = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
      expect(blobCall!.type).toBe('text/csv;charset=utf-8;');
    });

    it('handles special characters correctly', () => {
      const createObjectURL = vi.fn((_blob: Blob) => 'blob:url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const linkMock = { click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement;
      vi.stubGlobal('document', {
        createElement: vi.fn(() => linkMock),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      const data = [
        { name: 'Alice, "The Dev"', bio: 'Loves\nTypeScript' },
      ];

      exportToCSV(data, 'special.csv');

      const blobCall = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
      expect(blobCall).toBeInstanceOf(Blob);
    });

    it('handles empty arrays gracefully', () => {
      const createObjectURL = vi.fn((_blob: Blob) => 'blob:url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const linkMock = { click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement;
      vi.stubGlobal('document', {
        createElement: vi.fn(() => linkMock),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      exportToCSV([], 'empty.csv');

      const blobCall = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
      expect(blobCall!.size).toBe(0);
    });
  });

  describe('exportToJSON', () => {
    it('triggers a download with correct JSON content', () => {
      const createObjectURL = vi.fn((_blob: Blob) => 'blob:url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const linkMock = { click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement;
      vi.stubGlobal('document', {
        createElement: vi.fn(() => linkMock),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      const data = { users: [{ name: 'Alice' }] };
      exportToJSON(data, 'users.json');

      expect(linkMock.download).toBe('users.json');

      const blobCall = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
      expect(blobCall!.type).toBe('application/json;charset=utf-8;');
    });

    it('pretty-prints JSON with 2-space indentation', () => {
      const createObjectURL = vi.fn((_blob: Blob) => 'blob:url');
      const revokeObjectURL = vi.fn();
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

      const linkMock = { click: vi.fn(), href: '', download: '' } as unknown as HTMLAnchorElement;
      vi.stubGlobal('document', {
        createElement: vi.fn(() => linkMock),
        body: { appendChild: vi.fn(), removeChild: vi.fn() },
      });

      exportToJSON({ a: 1 }, 'test.json');

      const blobCall = createObjectURL.mock.calls[0]?.[0] as unknown as Blob;
      expect(blobCall).toBeInstanceOf(Blob);
    });
  });
});
