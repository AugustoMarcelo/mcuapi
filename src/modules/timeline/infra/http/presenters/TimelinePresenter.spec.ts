import { presentTimeline } from './TimelinePresenter';

const baseUrl = 'http://localhost:3333';

describe('TimelinePresenter', () => {
  it('Should link entries to movies or tvshows based on type', () => {
    const timeline = [
      {
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        entries: [
          { id: 1, title: 'Iron Man', chronology_order: 3, type: 'movie' },
          { id: 2, title: 'Loki', chronology_order: 5, type: 'tvshow' },
        ],
      },
    ];

    const presented = presentTimeline(timeline, baseUrl);

    expect(presented[0].continuity).toBe('MCU');
    expect(presented[0].entries[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
    expect(presented[0].entries[1]._links.self).toEqual({
      href: `${baseUrl}/api/v1/tvshows/2`,
    });
  });

  it('Should default unknown types to movie links', () => {
    const timeline = [
      {
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        entries: [
          { id: 4, title: 'One-Shot', chronology_order: 1, type: 'one-shot' },
        ],
      },
    ];

    const presented = presentTimeline(timeline, baseUrl);

    expect(presented[0].entries[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/movies/4`,
    });
  });
});
