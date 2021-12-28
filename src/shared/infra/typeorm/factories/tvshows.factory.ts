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
    imdb_id: 'tt9140560',
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
    imdb_id: 'tt9208876',
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
    last_aired_date: new Date(2021, 6, 14),
    directed_by: 'Kate Herron',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt9140554',
  },
  {
    id: 4,
    title: 'What If...?',
    overview:
      '"What If…?" flips the script on the MCU, reimagining famous events from the films in unexpected ways. Marvel Studios’ first animated series focuses on different heroes from the MCU, featuring a voice cast that includes a host of stars who reprise their roles. Directed by Bryan Andrews with AC Bradley as head writer, “What If…?" launches exclusively on Disney+ on August 11, 2021.',
    cover_url:
      'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/what_if.jpg',
    trailer_url:
      'https://assets.espn.go.com/players/web-player-bundle/next/embed/share.html#id=6262751537001&brand=marvel',
    number_seasons: 1,
    number_episodes: 9,
    release_date: new Date(2021, 7, 11),
    last_aired_date: new Date(2021, 9, 6),
    directed_by: 'Bryan Andrew',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt10168312',
  },
  {
    id: 5,
    title: 'Hawkeye',
    overview:
      'Marvel Studios’ "Hawkeye" stars Jeremy Renner as Hawkeye, who teams up with another well-known archer from the Marvel comics, Kate Bishop, played by Hailee Steinfeld. The cast also includes Vera Farmiga, Fra Fee, Tony Dalton, Zahn McClarnon, Brian d’Arcy James and newcomer Alaqua Cox as Maya Lopez. “Hawkeye” is helmed by Rhys Thomas and directing duo Bert and Bertie.',
    cover_url:
      'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/hawkeye.jpg',
    trailer_url: 'https://youtu.be/5VYb3B1ETlk',
    number_seasons: 1,
    number_episodes: 6,
    release_date: new Date(2021, 10, 24),
    last_aired_date: new Date(2021, 11, 22),
    directed_by: 'Rhys Thomas, Bert and Bertie',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt10160804',
  },
];

export default tvshows;
