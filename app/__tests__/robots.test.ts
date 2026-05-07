import { describe, expect, it } from 'vitest';
import robots from '../robots';

describe('robots', () => {
  it('disallows admin routes in addition to API and Next internals', () => {
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;

    expect(rule.disallow).toEqual(expect.arrayContaining(['/admin/', '/api/', '/_next/']));
  });
});
