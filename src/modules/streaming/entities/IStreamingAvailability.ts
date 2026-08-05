/** How a title is offered by a provider. */
export type OfferType = 'subscription' | 'rent' | 'buy' | 'free' | 'ads';

export const OFFER_TYPES: OfferType[] = [
  'subscription',
  'rent',
  'buy',
  'free',
  'ads',
];

export default interface IStreamingAvailability {
  id: number;
  /** Exactly one of `movie_id` / `tvshow_id` is set. */
  movie_id: number | null;
  tvshow_id: number | null;
  /** ISO 3166-1 alpha-2, uppercase. */
  region: string;
  provider: string;
  offer_type: OfferType;
  url: string | null;
  created_at: Date;
  updated_at: Date;
}
