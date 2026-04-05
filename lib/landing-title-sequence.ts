export interface SignalDeckMeta {
  family: string;
  descriptor: string;
}

interface ThemeSequenceMeta {
  phraseKey: string;
  leadWord: string;
  roleWord: string;
  familyKey: string;
}

type SequenceTheme = {
  text: string;
};

const SIGNAL_FAMILY_RULES: Array<{ pattern: RegExp; meta: SignalDeckMeta }> = [
  { pattern: /\barchitect\b/i, meta: { family: 'Architect', descriptor: 'systems precision' } },
  { pattern: /\b(sorcerer|mystic|conjurer)\b/i, meta: { family: 'Mystic', descriptor: 'arcane computation' } },
  { pattern: /\balchemist\b/i, meta: { family: 'Alchemist', descriptor: 'transmutation lab' } },
  { pattern: /\bdesigner\b/i, meta: { family: 'Designer', descriptor: 'semantic motion' } },
  { pattern: /\bsculptor\b/i, meta: { family: 'Sculptor', descriptor: 'tactile systems' } },
  { pattern: /\b(artisan|craftsman)\b/i, meta: { family: 'Artisan', descriptor: 'forged reliability' } },
  { pattern: /\bcrafter\b/i, meta: { family: 'Crafter', descriptor: 'living systems' } },
  { pattern: /\b(virtuoso|artist)\b/i, meta: { family: 'Virtuoso', descriptor: 'performance energy' } },
  { pattern: /\b(mage|weaver)\b/i, meta: { family: 'Weaver', descriptor: 'procedural spellwork' } },
  { pattern: /\b(visionary|dreamer|futurist)\b/i, meta: { family: 'Visionary', descriptor: 'long-horizon signal' } },
  { pattern: /\b(shaper|cartographer|mapper)\b/i, meta: { family: 'Cartographer', descriptor: 'route synthesis' } },
  { pattern: /\borchestrator\b/i, meta: { family: 'Orchestrator', descriptor: 'coordinated crescendo' } },
];

const DEFAULT_SIGNAL_DECK: SignalDeckMeta = {
  family: 'Builder',
  descriptor: 'intentional systems craft',
};

function normalizeSequenceToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getThemeSequenceMeta(text: string): ThemeSequenceMeta {
  const phraseKey = normalizeSequenceToken(text);
  const words = phraseKey.split(/\s+/).filter(Boolean);

  return {
    phraseKey,
    leadWord: words[0] ?? phraseKey,
    roleWord: words.at(-1) ?? phraseKey,
    familyKey: normalizeSequenceToken(deriveSignalDeckMeta(text).family),
  };
}

function shuffleArray<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }

  return copy;
}

function canFollow<T extends SequenceTheme>(previousTheme: T | null | undefined, nextTheme: T): boolean {
  return !previousTheme || !hasThemeAdjacencyConflict(previousTheme, nextTheme);
}

function hasFutureOption<T extends SequenceTheme>(nextTheme: T, remainingThemes: readonly T[]): boolean {
  return remainingThemes.length === 0
    || remainingThemes.some((candidate) => !hasThemeAdjacencyConflict(nextTheme, candidate));
}

export function deriveSignalDeckMeta(text: string): SignalDeckMeta {
  return SIGNAL_FAMILY_RULES.find(({ pattern }) => pattern.test(text))?.meta ?? DEFAULT_SIGNAL_DECK;
}

export function hasThemeAdjacencyConflict<T extends SequenceTheme>(currentTheme: T, nextTheme: T): boolean {
  const currentMeta = getThemeSequenceMeta(currentTheme.text);
  const nextMeta = getThemeSequenceMeta(nextTheme.text);

  return currentMeta.phraseKey === nextMeta.phraseKey
    || currentMeta.leadWord === nextMeta.leadWord
    || currentMeta.roleWord === nextMeta.roleWord
    || currentMeta.familyKey === nextMeta.familyKey;
}

export function buildRotationSequence<T extends SequenceTheme>(
  themes: readonly T[],
  previousTheme?: T | null,
  maxAttempts = 128,
): T[] {
  if (themes.length <= 1) {
    return [...themes];
  }

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const pool = shuffleArray(themes);
    const sequence: T[] = [];
    let anchor = previousTheme ?? null;

    while (pool.length > 0) {
      const candidateIndex = pool.findIndex((candidate, index) => {
        if (!canFollow(anchor, candidate)) {
          return false;
        }

        const remainingThemes = pool.filter((_, poolIndex) => poolIndex !== index);
        return hasFutureOption(candidate, remainingThemes);
      });

      if (candidateIndex === -1) {
        break;
      }

      const [candidate] = pool.splice(candidateIndex, 1);
      sequence.push(candidate);
      anchor = candidate;
    }

    if (sequence.length === themes.length) {
      return sequence;
    }
  }

  const fallback = shuffleArray(themes);

  if (previousTheme) {
    const safeStartIndex = fallback.findIndex((candidate) => !hasThemeAdjacencyConflict(previousTheme, candidate));

    if (safeStartIndex > 0) {
      return [...fallback.slice(safeStartIndex), ...fallback.slice(0, safeStartIndex)];
    }
  }

  return fallback;
}
