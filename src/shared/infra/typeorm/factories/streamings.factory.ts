import IMovieStreaming from '@modules/streamings/entities/IMovieStreaming';
import ITVShowStreaming from '@modules/streamings/entities/ITVShowStreaming';

enum streamings {
  DISNEYPLUS = 'Disney+',
  STARPLUS = 'Star+',
  NETFLIX = 'Netflix',
  HBOMAX = 'HBO Max',
}

const movieStreamings: IMovieStreaming[] = [
  {
    movie_id: 1,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-iron-man/6aM2a8mZATiu/',
  },
  {
    movie_id: 2,
    platform: streamings.NETFLIX,
    url: 'https://www.netflix.com/title/70087537',
  },
  {
    movie_id: 3,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/iron-man-2/lXjCr9QmGGQJ',
  },
  {
    movie_id: 4,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/thor/1p4vdKzTuhzr',
  },
  {
    movie_id: 5,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/captain-america-the-first-avenger/6xvB6xZ4r95O',
  },
  {
    movie_id: 6,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-the-avengers/2h6PcHFDbsPy',
  },
  {
    movie_id: 7,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/iron-man-3/3s4Ihq7P2c6e',
  },
  {
    movie_id: 8,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/thor-the-dark-world/ZHk7aM5xTbW7',
  },
  {
    movie_id: 9,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/captain-america-the-winter-soldier/TVme5whcowSy',
  },
  {
    movie_id: 10,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/guardians-of-the-galaxy/1S4WM9h3KRR6',
  },
  {
    movie_id: 11,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-avengers-age-of-ultron/76IUxY0rNHzt',
  },
  {
    movie_id: 12,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-ant-man/5c92KVf1zgUX',
  },
  {
    movie_id: 13,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-captain-america-civil-war/4ovfyKnnIBCg',
  },
  {
    movie_id: 14,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-doctor-strange/4GgMJ1aHKHA2',
  },
  {
    movie_id: 15,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-guardians-of-the-galaxy-vol-2/ZdRX4mMbp1gM',
  },
  {
    movie_id: 16,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/spider-man-homecoming/4cLMEzWGqQaG',
  },
  {
    movie_id: 17,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-thor-ragnarok/3XqAT8UV8ojS',
  },
  {
    movie_id: 18,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/black-panther/1GuXuYPj99Ke',
  },
  {
    movie_id: 19,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-avengers-infinity-war/1WEuZ7H6y39v',
  },
  {
    movie_id: 20,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-ant-man-and-the-wasp/5D7wkVHmlCKU',
  },
  {
    movie_id: 21,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-captain-marvel/38xJGlLAQy9a',
  },
  {
    movie_id: 22,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/marvel-studios-avengers-endgame/aRbVJUb2h2Rf',
  },
  {
    movie_id: 23,
    platform: streamings.NETFLIX,
    url: 'https://www.netflix.com/title/81055822',
  },
  {
    movie_id: 24,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/black-widow/3VfTap90rwZC',
  },
  {
    movie_id: 25,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/shang-chi-and-the-legend-of-the-ten-rings/5GyV9sf9Y041',
  },
  {
    movie_id: 26,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/eternals/5cmhJAtkt6Jk',
  },
  {
    movie_id: 27,
    platform: streamings.HBOMAX,
    url: 'https://play.hbomax.com/page/urn:hbo:page:GYqeASQeezEo8igEAAACK:type:feature',
  },
  {
    movie_id: 28,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/doctor-strange-in-the-multiverse-of-madness/27EiqSW4jIyH',
  },
  {
    movie_id: 29,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/thor-love-and-thunder/3htR8mRAZMoT',
  },
  {
    movie_id: 30,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/black-panther-wakanda-forever/7MAONYZ92wDT',
  },
];

const tvshowStreamings: ITVShowStreaming[] = [
  {
    tvshow_id: 1,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/wandavision/4SrN28ZjDLwH',
  },
  {
    tvshow_id: 2,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/the-falcon-and-the-winter-soldier/4gglDBMx8icA',
  },
  {
    tvshow_id: 3,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/loki/6pARMvILBGzF',
  },
  {
    tvshow_id: 4,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/what-if/7672ZVj1ZxU9',
  },
  {
    tvshow_id: 5,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/hawkeye/11Zy8m9Dkj5l',
  },
  {
    tvshow_id: 6,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/moon-knight/4S3oOF1knocS',
  },
  {
    tvshow_id: 7,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/ms-marvel/45BsikoMcOOo',
  },
  {
    tvshow_id: 8,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/groots-first-steps/4YcuPHl87ZEw',
  },
  {
    tvshow_id: 9,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/series/she-hulk-attorney-at-law/gPwaYusKqRQh',
  },
  {
    tvshow_id: 10,
    platform: streamings.DISNEYPLUS,
    url: 'https://www.disneyplus.com/movies/werewolf-by-night/J1sCDfT3MaDl',
  },
];

export { movieStreamings, tvshowStreamings };
