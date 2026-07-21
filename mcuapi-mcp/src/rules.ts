export const KNOWN_EARTHS: Record<string, string> = {
  'Earth-616': 'MCU (official designation)',
  'Earth-10005': 'FOX X-Men Universe',
  'Earth-96283': 'Raimi Spider-Man (Sony)',
  'Earth-120703': 'Webb Spider-Man (Sony)',
  'Earth-838': 'Illuminati Universe (Doctor Strange MoM)',
  'Earth-TRN414': 'Deadpool / Wade Wilson (FOX)',
};

export const KNOWN_CONTINUITIES = [
  'MCU',
  'FOX X-Men Universe',
  'Sony Spider-Man Universe',
  'FOX Fantastic Four',
];

export const KNOWN_STUDIOS = ['Marvel Studios', 'FOX', 'Sony', 'Lionsgate'];

export function applyMovieDefaults(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const merged = {
    studio: 'Marvel Studios',
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    type: 'movie',
    ...data,
  };
  (merged as Record<string, unknown>).is_mcu =
    data.is_mcu !== undefined ? data.is_mcu : merged.continuity === 'MCU';
  return merged;
}

export function applyTVShowDefaults(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const merged = {
    studio: 'Marvel Studios',
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    type: 'tvshow',
    ...data,
  };
  (merged as Record<string, unknown>).is_mcu =
    data.is_mcu !== undefined ? data.is_mcu : merged.continuity === 'MCU';
  return merged;
}

export function applyCharacterDefaults(
  data: Record<string, unknown>,
): Record<string, unknown> {
  return {
    continuity: 'MCU',
    multiverse_designation: 'Earth-616',
    ...data,
  };
}

export function validateEarth(designation: string): string | null {
  if (!designation) return null;
  if (KNOWN_EARTHS[designation]) return null;
  const similar = Object.keys(KNOWN_EARTHS).find(e =>
    e.toLowerCase().includes(designation.toLowerCase().replace('earth-', '')),
  );
  return similar
    ? `Unknown Earth "${designation}". Did you mean "${similar}"? Known: ${Object.keys(
        KNOWN_EARTHS,
      ).join(', ')}`
    : `Unknown Earth "${designation}". Known: ${Object.keys(KNOWN_EARTHS).join(
        ', ',
      )}`;
}
