import ITVShow from '@modules/tvshows/entities/ITVShow';

const tvshows: ITVShow[] = [
  {
    id: 1,
    title: 'WandaVision',
    overview:
      'Marvel Studios captivating new series "WandaVision" which premieres in early 2021 on Disney+. Starring Elizabeth Olsen and Paul Bettany, "WandaVision" marks the first series from Marvel Studios streaming exclusively on Disney+. The series is a blend of classic television and the Marvel Cinematic Universe in which Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems',
    cover_url:
      'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/wandavision.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215509803001',
    number_seasons: 1,
    number_episodes: 9,
    release_date: new Date(2021, 0, 15),
    last_aired_date: new Date(2021, 2, 5),
    directed_by: 'Matt Shakman',
    phase: 4,
    saga: undefined,
  },
  {
    id: 2,
    title: 'The Falcon and The Winter Soldier',
    overview:
      'Following the events of "Avengers: Endgame" Sam Wilson/Falcon (Anthony Mackie) and Bucky Barnes/Winter Soldier (Sebastian Stan) team up in a global adventure that tests their abilities—and their patience—in Marvel Studios’ “The Falcon and The Winter Soldier.” The all-new series is directed by Kari Skogland; Malcolm Spellman is the head writer. Streaming exclusively on Disney+.',
    cover_url:
      'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/the-falcon-and-the-winter-soldier.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215508715001',
    number_seasons: 1,
    number_episodes: 6,
    release_date: new Date(2021, 2, 19),
    last_aired_date: new Date(2021, 3, 23),
    directed_by: 'Kari Skogland',
    phase: 4,
    saga: undefined,
  },
  {
    id: 3,
    title: 'Loki',
    overview:
      'In Marvel Studios’ "Loki" the mercurial villain Loki (Tom Hiddleston) resumes his role as the God of Mischief in a new series that takes place after the events of “Avengers: Endgame.” Kate Herron directs and Michael Waldron is head writer. Debuts on Disney+ in June 9, 2021.',
    cover_url:
      'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/loki.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215507931001',
    number_seasons: 1,
    number_episodes: 6,
    release_date: new Date(2021, 5, 9),
    last_aired_date: undefined,
    directed_by: 'Kate Herron',
    phase: 4,
    saga: undefined,
  },
];

export default tvshows;
