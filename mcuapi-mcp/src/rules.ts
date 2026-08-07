/**
 * A designation is only recorded when Marvel — or a director of the title —
 * actually stated it: on screen, in an official publication, or in an interview.
 * Fan wikis hand out reality numbers for practically every adaptation; none of
 * those belong here. Anything undisclosed is 'Unknown'.
 */
export const KNOWN_EARTHS: Record<string, string> = {
  'Earth-616': 'MCU — on screen in No Way Home; official timeline book',
  'Earth-838': 'Illuminati Universe — on screen in Doctor Strange 2',
  'Earth-828': 'The Fantastic Four: First Steps — on screen; confirmed by Matt Shakman',
  'Earth-10005': 'FOX X-Men Universe — on the TVA screens in Deadpool & Wolverine',
  Unknown: 'Designation never disclosed by Marvel or a director',
};

export const KNOWN_CONTINUITIES = [
  'MCU',
  'X-Men Universe',
  'Sony Spider-Man Universe',
  'FOX Fantastic Four',
  'FOX Daredevil',
  'Blade Trilogy',
  // Non-canon Marvel Television, named per franchise rather than lumped together
  'Agents of S.H.I.E.L.D.',
  'Agent Carter',
  'Marvel YA',
  'Adventure into Fear',
  'Inhumans',
];

export const KNOWN_STUDIOS = [
  'Marvel Studios',
  'Marvel Television',
  '20th Century Fox',
  'Sony Pictures',
  'New Line Cinema',
];

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

  const accepted = Object.keys(KNOWN_EARTHS).join(', ');

  // An Earth-<digits> value that is not on the list is almost always a number
  // lifted from Marvel Database rather than something Marvel ever said.
  if (/^Earth-\d+$/i.test(designation)) {
    return `"${designation}" is not a disclosed designation. Marvel Database and the Handbook Appendix assign reality numbers to nearly every adaptation, but those were never stated by Marvel or a director — use "Unknown" instead. Accepted: ${accepted}`;
  }

  return `Unrecognised designation "${designation}". Accepted: ${accepted}`;
}
