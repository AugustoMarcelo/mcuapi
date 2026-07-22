import { IResourceLinks } from '@shared/infra/http/hateoas';

interface ITimelineEntry {
  id: number;
  title: string;
  chronology_order: number;
  type: string;
}

interface ITimelineContinuity {
  continuity: string;
  multiverse_designation: string;
  entries: ITimelineEntry[];
}

type ITimelineEntryWithLinks = ITimelineEntry & { _links: IResourceLinks };

export function presentTimeline(
  timeline: ITimelineContinuity[],
  baseUrl: string,
): Array<ITimelineContinuity & { entries: ITimelineEntryWithLinks[] }> {
  return timeline.map(continuity => ({
    ...continuity,
    entries: continuity.entries.map(entry => ({
      ...entry,
      _links: {
        self: {
          href:
            entry.type === 'tvshow'
              ? `${baseUrl}/api/v1/tvshows/${entry.id}`
              : `${baseUrl}/api/v1/movies/${entry.id}`,
        },
      },
    })),
  }));
}
