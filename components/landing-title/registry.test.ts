import { describe, expect, it } from 'vitest';

import { ARCANE_SHOWCASE_RENDERERS } from '@/components/landing-title/arcane';
import { CRAFTED_SHOWCASE_RENDERERS } from '@/components/landing-title/crafted';
import { PERFORMANCE_SHOWCASE_RENDERERS } from '@/components/landing-title/performance';
import {
  DEFAULT_LANDING_TITLE_SUBTITLE_ID,
  DEPRECATED_SUBTITLE_ALIASES,
  LANDING_TITLE_RENDERERS,
  LANDING_TITLE_SUBTITLE_OPTIONS,
  getSubtitleOptionById,
  getSubtitleOptionByText,
  getSubtitleRenderer,
  getSubtitleRendererById,
  getSubtitleRendererByText,
  resolveSubtitleOption,
} from '@/components/landing-title/registry';
import { SYSTEMS_SHOWCASE_RENDERERS } from '@/components/landing-title/systems';

const EXPECTED_SUBTITLE_ORDER = [
  'cybernetic-architect',
  'zero-trust-architect',
  'synthetic-intelligence-architect',
  'quantum-designer',
  'cloud-shaper',
  'ai-cartographer',
  'data-orchestrator',
  'data-sorcerer',
  'workflow-mage',
  'algorithm-weaver',
  'silicon-conjurer',
  'systems-seer',
  'signal-oracle',
  'code-alchemist',
  'digital-sculptor',
  'holographic-sculptor',
  'cyber-defense-artisan',
  'blockchain-artisan',
  'frontier-forger',
  'automation-virtuoso',
  'kinetic-machinist',
  'cortex-diviner',
] as const;

const EXPECTED_VISIBLE_TITLES = [
  'cyber tactician',
  'zero trust sentinel',
  'cognitive strategist',
  'quantum designer',
  'platform surveyor',
  'AI cartographer',
  'data orchestrator',
  'data sorcerer',
  'workflow mage',
  'logic weaver',
  'silicon conjurer',
  'circuit seer',
  'signal oracle',
  'code alchemist',
  'digital sculptor',
  'holosculptor',
  'bastion warden',
  'lattice smith',
  'frontier forger',
  'automation virtuoso',
  'kinetic machinist',
  'cortex diviner',
] as const;

const EXPECTED_RENDERER_OBJECTS = [
  ...SYSTEMS_SHOWCASE_RENDERERS,
  ...ARCANE_SHOWCASE_RENDERERS,
  ...CRAFTED_SHOWCASE_RENDERERS,
  ...PERFORMANCE_SHOWCASE_RENDERERS,
] as const;

function normalizeSelection(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

describe('landing title registry contract', () => {
  it('keeps subtitle ids unique and aligned with registry entries', () => {
    const ids = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const option of LANDING_TITLE_SUBTITLE_OPTIONS) {
      const renderer = getSubtitleRendererById(option.id);

      expect(renderer).not.toBeNull();
      expect(renderer?.id).toBe(option.id);
      expect(renderer?.lane).toBe(option.lane);
      expect(renderer?.text).toBe(option.text);
      expect(renderer?.signalDeck).toEqual(option.signalDeck);
    }
  });

  it('preserves the exact 22-item subtitle order with unique display text', () => {
    const ids = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id);
    const texts = LANDING_TITLE_SUBTITLE_OPTIONS.map(({ text }) => text);

    expect(ids).toHaveLength(22);
    expect(ids).toEqual(EXPECTED_SUBTITLE_ORDER);
    expect(texts).toEqual(EXPECTED_VISIBLE_TITLES);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('resolves lab selections from stable ids and legacy display text', () => {
    const selected = LANDING_TITLE_SUBTITLE_OPTIONS.find(({ id }) => id === DEFAULT_LANDING_TITLE_SUBTITLE_ID);
    expect(selected).toBeDefined();

    expect(resolveSubtitleOption(selected?.id ?? null)).toEqual(selected);
    expect(resolveSubtitleOption(selected?.text ?? null)).toEqual(selected);
    expect(resolveSubtitleOption('not-a-real-subtitle')).toEqual(
      LANDING_TITLE_SUBTITLE_OPTIONS[0],
    );
  });

  it('preserves the legacy lookup surface while preferring stable ids', () => {
    const renderer = LANDING_TITLE_RENDERERS[0];
    expect(renderer).toBeDefined();

    expect(getSubtitleRenderer(renderer?.id ?? '')).toBe(renderer);
    expect(getSubtitleRenderer(renderer?.text ?? '')).toBe(renderer);
  });

  it('keeps registry entries bound to the bespoke lane renderers', () => {
    expect(LANDING_TITLE_RENDERERS).toEqual(EXPECTED_RENDERER_OBJECTS);

    for (const renderer of EXPECTED_RENDERER_OBJECTS) {
      expect(getSubtitleRendererById(renderer.id)).toBe(renderer);
    }
  });
});

describe('deprecated subtitle alias compatibility', () => {
  it('maps every alias to a valid current id', () => {
    const currentIds = new Set(LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => id));
    for (const [legacy, target] of Object.entries(DEPRECATED_SUBTITLE_ALIASES)) {
      expect(currentIds.has(target), `alias "${legacy}" → "${target}" is not a current id`).toBe(true);
    }
  });

  it('does not shadow any current id or text', () => {
    const currentIds = new Set(LANDING_TITLE_SUBTITLE_OPTIONS.map(({ id }) => normalizeSelection(id)));
    const currentTexts = new Set(LANDING_TITLE_SUBTITLE_OPTIONS.map(({ text }) => normalizeSelection(text)));

    for (const key of Object.keys(DEPRECATED_SUBTITLE_ALIASES)) {
      const normalizedKey = normalizeSelection(key);

      expect(currentIds.has(normalizedKey), `alias key "${key}" collides with a current id`).toBe(false);
      expect(currentTexts.has(normalizedKey), `alias key "${key}" collides with a current text`).toBe(false);
    }
  });

  it('resolves renamed old display texts to the correct current entry', () => {
    const cases: [string, string][] = [
      ['cybernetic architect', 'cybernetic-architect'],
      ['cyber architect', 'cybernetic-architect'],
      ['zero trust architect', 'zero-trust-architect'],
      ['synthetic intelligence architect', 'synthetic-intelligence-architect'],
      ['cognitive architect', 'synthetic-intelligence-architect'],
      ['AI mapper', 'ai-cartographer'],
      ['cloud shaper', 'cloud-shaper'],
      ['platform architect', 'cloud-shaper'],
      ['signal conductor', 'data-orchestrator'],
      ['signal orchestrator', 'data-orchestrator'],
      ['archive sorcerer', 'data-sorcerer'],
      ['sigil mage', 'workflow-mage'],
      ['algorithm weaver', 'algorithm-weaver'],
      ['systems seer', 'systems-seer'],
      ['holographic sculptor', 'holographic-sculptor'],
      ['cyber defense artisan', 'cyber-defense-artisan'],
      ['bastion artisan', 'cyber-defense-artisan'],
      ['blockchain artisan', 'blockchain-artisan'],
      ['lattice artisan', 'blockchain-artisan'],
      ['emergence mystic', 'systems-seer'],
    ];
    for (const [oldText, expectedId] of cases) {
      const renderer = getSubtitleRendererByText(oldText);
      expect(renderer, `"${oldText}" should resolve via text alias`).not.toBeNull();
      expect(renderer?.id).toBe(expectedId);

      const option = getSubtitleOptionByText(oldText);
      expect(option, `"${oldText}" should resolve option via text alias`).not.toBeNull();
      expect(option?.id).toBe(expectedId);
    }
  });

  it('normalizes whitespace and casing for current and legacy text lookups', () => {
    expect(getSubtitleRenderer('  AI   Mapper  ')?.id).toBe('ai-cartographer');
    expect(getSubtitleRenderer('  Cloud   Shaper ')?.id).toBe('cloud-shaper');
    expect(getSubtitleRenderer('  Signal   Conductor ')?.id).toBe('data-orchestrator');
    expect(getSubtitleRenderer('  Systems   Seer ')?.id).toBe('systems-seer');
    expect(getSubtitleRenderer('  Emergence   Mystic ')?.id).toBe('systems-seer');

    expect(getSubtitleOptionByText('  AI   Mapper  ')?.id).toBe('ai-cartographer');
    expect(getSubtitleOptionByText('  Cloud   Shaper ')?.id).toBe('cloud-shaper');
    expect(getSubtitleOptionByText('  Signal   Conductor ')?.id).toBe('data-orchestrator');
    expect(getSubtitleOptionByText('  Systems   Seer ')?.id).toBe('systems-seer');
    expect(getSubtitleOptionByText('  Emergence   Mystic ')?.id).toBe('systems-seer');
  });

  it('normalizes casing and whitespace for current ids as well as text', () => {
    expect(getSubtitleOptionById('  DATA-ORCHESTRATOR  ')?.id).toBe('data-orchestrator');
    expect(getSubtitleOptionById('  AI-CARTOGRAPHER  ')?.id).toBe('ai-cartographer');
    expect(resolveSubtitleOption('  AI   Mapper  ')?.id).toBe('ai-cartographer');
  });

  it('resolves dropped old display texts to a consolidated current entry', () => {
    const cases: [string, string][] = [
      ['code architect', 'cybernetic-architect'],
      ['ecosystem designer', 'quantum-designer'],
      ['machine learning designer', 'quantum-designer'],
      ['augmented reality sculptor', 'holographic-sculptor'],
      ['resilience sculptor', 'digital-sculptor'],
      ['cybersecurity artisan', 'cyber-defense-artisan'],
      ['knowledge craftsman', 'frontier-forger'],
      ['intelligent systems artist', 'cortex-diviner'],
      ['platform visionary', 'cloud-shaper'],
      ['digital futurist', 'ai-cartographer'],
      ['technological mapper', 'ai-cartographer'],
    ];
    for (const [oldText, expectedId] of cases) {
      const renderer = getSubtitleRenderer(oldText);
      expect(renderer, `"${oldText}" should resolve via alias`).not.toBeNull();
      expect(renderer?.id).toBe(expectedId);
    }
  });

  it('resolves old slugified pseudo-ids via getSubtitleRendererById', () => {
    const cases: [string, string][] = [
      ['code-architect', 'cybernetic-architect'],
      ['innovation-mystic', 'systems-seer'],
      ['emergence-mystic', 'systems-seer'],
      ['distributed-systems-alchemist', 'code-alchemist'],
      ['process-designer', 'quantum-designer'],
      ['experience-sculptor', 'digital-sculptor'],
      ['intelligence-artisan', 'blockchain-artisan'],
      ['future-systems-crafter', 'frontier-forger'],
      ['frontier-crafter', 'frontier-forger'],
      ['scalability-artist', 'cortex-diviner'],
      ['robotics-artist', 'kinetic-machinist'],
      ['neural-artist', 'cortex-diviner'],
      ['enterprise-dreamer', 'cloud-shaper'],
      ['signal-orchestrator', 'data-orchestrator'],
    ];
    for (const [oldId, expectedId] of cases) {
      const renderer = getSubtitleRendererById(oldId);
      expect(renderer, `"${oldId}" should resolve via id alias`).not.toBeNull();
      expect(renderer?.id).toBe(expectedId);

      const option = getSubtitleOptionById(oldId);
      expect(option, `"${oldId}" should resolve option via id alias`).not.toBeNull();
      expect(option?.id).toBe(expectedId);
    }
  });

  it('keeps the signal orchestrator legacy text and slug pinned to the current conductor subtitle', () => {
    const legacyTextOption = getSubtitleOptionByText('signal orchestrator');
    expect(legacyTextOption).not.toBeNull();
    expect(legacyTextOption?.id).toBe('data-orchestrator');
    expect(legacyTextOption?.text).toBe('data orchestrator');

    const legacySlugOption = getSubtitleOptionById('signal-orchestrator');
    expect(legacySlugOption).not.toBeNull();
    expect(legacySlugOption?.id).toBe('data-orchestrator');
    expect(legacySlugOption?.text).toBe('data orchestrator');

    const resolvedLegacySlug = resolveSubtitleOption('signal-orchestrator');
    expect(resolvedLegacySlug.id).toBe('data-orchestrator');
    expect(resolvedLegacySlug.text).toBe('data orchestrator');
  });

  it('resolves legacy values through resolveSubtitleOption without falling to default', () => {
    const defaultOption = LANDING_TITLE_SUBTITLE_OPTIONS[0];

    const renamedText = resolveSubtitleOption('archive sorcerer');
    expect(renamedText.id).toBe('data-sorcerer');
    expect(renamedText.id).not.toBe(defaultOption.id === 'data-sorcerer' ? '__impossible__' : defaultOption.id);

    const retiredVisibleText = resolveSubtitleOption('systems seer');
    expect(retiredVisibleText.id).toBe('systems-seer');

    const renamedSystemsSlug = resolveSubtitleOption('signal-orchestrator');
    expect(renamedSystemsSlug.id).toBe('data-orchestrator');

    const droppedText = resolveSubtitleOption('machine learning designer');
    expect(droppedText.id).toBe('quantum-designer');

    const oldSlug = resolveSubtitleOption('systems-alchemist');
    expect(oldSlug.id).toBe('code-alchemist');
  });

  it('still falls back to default for truly unknown values', () => {
    expect(resolveSubtitleOption('not-a-real-subtitle')).toEqual(
      LANDING_TITLE_SUBTITLE_OPTIONS[0],
    );
    expect(resolveSubtitleOption(null)).toEqual(LANDING_TITLE_SUBTITLE_OPTIONS[0]);
  });

  it('preserves direct current id and text lookups unchanged', () => {
    for (const option of LANDING_TITLE_SUBTITLE_OPTIONS) {
      expect(getSubtitleRendererById(option.id)?.id).toBe(option.id);
      expect(getSubtitleRendererByText(option.text)?.id).toBe(option.id);
      expect(getSubtitleOptionById(option.id)?.id).toBe(option.id);
      expect(getSubtitleOptionByText(option.text)?.id).toBe(option.id);
    }
  });
});
