const baseUrls = ['http://localhost:3000/', 'http://localhost:3000/blog'];
const studioUrls = ['http://localhost:3000/studio/new'];

if (process.env.POSTGRES_URL) {
  studioUrls.unshift('http://localhost:3000/studio');
}

export const ci = {
  collect: {
    url: [...baseUrls, ...studioUrls],
    numberOfRuns: 3,
    startServerCommand: 'pnpm start',
    startServerReadyPattern: 'ready',
    startServerReadyTimeout: 30000,
  },
  assert: {
    assertMatrix: [
      {
        matchingUrlPattern: '^(?!.*\\/studio\\/new$).*',
        assertions: {
          'categories:performance': ['error', { minScore: 0.8 }],
          'categories:accessibility': ['error', { minScore: 0.95 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': ['error', { minScore: 0.9 }],
        },
      },
      {
        matchingUrlPattern: '.*/studio/new$',
        assertions: {
          'categories:performance': ['error', { minScore: 0.8 }],
          'categories:accessibility': ['error', { minScore: 0.95 }],
          'categories:best-practices': ['error', { minScore: 0.9 }],
          'categories:seo': 'off',
        },
      },
    ],
  },
  upload: {
    target: 'temporary-public-storage',
  },
};
