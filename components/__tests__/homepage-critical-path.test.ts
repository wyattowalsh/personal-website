import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('homepage critical path', () => {
  it('does not statically import below-fold post card code in the client hero', () => {
    const source = readFileSync('components/HomePageClient.tsx', 'utf8');

    expect(source).not.toContain('import { PostCard }');
    expect(source).not.toContain('<PostCard');
  });

  it('disables title and profile ring animations for reduced-motion users', () => {
    const titleCss = readFileSync('components/landing-title/subtitle.module.css', 'utf8');
    const pageCss = readFileSync('app/page.module.css', 'utf8');

    expect(titleCss).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*\.enhancedTitleLanding[\s\S]*animation:\s*none/);
    expect(pageCss).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*\.imageContainer::before[\s\S]*animation:\s*none/);
  });

  it('defaults particles and MDX images to lower-cost settings', () => {
    const particlesSource = readFileSync('components/ParticlesBackground.tsx', 'utf8');
    const mdxSource = readFileSync('mdx-components.tsx', 'utf8');

    expect(particlesSource).toContain("useState<DensityLevel>('reduced')");
    expect(mdxSource).toContain('quality={85}');
    expect(mdxSource).not.toContain('quality={95}');
  });
});
