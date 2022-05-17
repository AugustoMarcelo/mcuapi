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
  {
    id: 6,
    title: 'Moon Knight',
    overview:
      "Moon Knight follows Steven Grant, a mild-mannered gift-shop employee, who becomes plagued with blackouts and memories of another life. Steven discovers he has dissociative identity disorder and shares a body with mercenary Marc Spector. As Steven/Marc's enemies converge upon them, they must navigate their complex identities while thrust into a deadly mystery among the powerful gods of Egypt.",
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1647469845/mcuapi/gallery/TV%20Shows/Moon%20Knight/Posters/3.jpg',
    trailer_url: 'https://youtu.be/x7Krla_UxRg',
    number_seasons: 1,
    number_episodes: 6,
    release_date: new Date(2022, 2, 30),
    last_aired_date: new Date(2022, 4, 4),
    directed_by: 'Mohamed Diab',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt10234724',
  },
  {
    id: 7,
    title: 'Ms. Marvel',
    overview:
      'Ms. Marvel is a new, original series that introduces Kamala Khan, a Muslim American teenager growing up in Jersey City. An avid gamer and a voracious fan-fiction scribe, Kamala is a Super Hero mega-fan with an oversized imagination—particularly when it comes to Captain Marvel. Yet Kamala feels invisible both at home and at school—that is, until she gets super powers like the heroes she’s always looked up to. Life gets better with super powers, right?',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1647388519/mcuapi/gallery/TV%20Shows/Ms.%20Marvel/Posters/1.jpg',
    trailer_url: 'https://youtu.be/m9EX0f6V11Y',
    number_seasons: 1,
    number_episodes: 6,
    release_date: new Date(2022, 5, 8),
    last_aired_date: new Date(2022, 6, 13),
    directed_by:
      'Adil El Arbi & Bilall Fallah, Meera Menon, Sharmeen Obaid-Chinoy',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt10857164',
  },
  {
    id: 8,
    title: 'She Hulk',
    overview:
      'She-Hulk: Attorney at Law follows Jennifer Walters as she navigates the complicated life of a single, 30-something attorney who also happens to be a green 6-foot-7-inch superpowered hulk. The nine-episode series welcomes a host of MCU vets, including Mark Ruffalo as Smart Hulk, Tim Roth as Emil Blonsky/the Abomination, and Benedict Wong as Wong.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1652825788/mcuapi/gallery/TV%20Shows/She%20Hulk/Posters/1.jpg',
    trailer_url: 'https://youtu.be/gim2kprjL50',
    number_seasons: 1,
    number_episodes: 9,
    release_date: new Date(2022, 6, 17),
    last_aired_date: undefined,
    directed_by: 'Kat Coiro and Anu Valia',
    phase: 4,
    saga: undefined,
    imdb_id: 'tt10857160',
  },
];

export default tvshows;
