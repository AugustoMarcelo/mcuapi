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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
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
    saga: 'Multiverse Saga',
    imdb_id: 'tt10857164',
  },
  {
    id: 8,
    title: 'I Am Groot',
    overview:
      'There’s no guarding the galaxy from this mischievous toddler! So get ready as Baby Groot takes center stage in his very own collection of shorts, exploring his glory days growing up — and getting into trouble — among the stars. I Am Groot, five original shorts featuring several new and unusual characters, stars everyone’s favorite little tree, Baby Groot, voiced by Vin Diesel, who voices Groot in the Guardians of the Galaxy franchise.',
    trailer_url: 'https://youtu.be/D7eFpRf4tac',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657229985/mcuapi/gallery/TV%20Shows/I%20Am%20Groot/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 5,
    release_date: new Date(2022, 7, 10),
    last_aired_date: new Date(2022, 7, 10),
    directed_by: '',
    phase: 4,
    saga: 'Multiverse Saga',
    imdb_id: 'tt13623148',
  },
  {
    id: 9,
    title: 'She Hulk: Attorney at Law',
    overview:
      'She-Hulk: Attorney at Law follows Jennifer Walters as she navigates the complicated life of a single, 30-something attorney who also happens to be a green 6-foot-7-inch superpowered hulk. The nine-episode series welcomes a host of MCU vets, including Mark Ruffalo as Smart Hulk, Tim Roth as Emil Blonsky/the Abomination, and Benedict Wong as Wong.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1652825788/mcuapi/gallery/TV%20Shows/She%20Hulk/Posters/1.jpg',
    trailer_url: 'https://youtu.be/u7JsKhI2An0',
    number_seasons: 1,
    number_episodes: 9,
    release_date: new Date(2022, 7, 17),
    last_aired_date: undefined,
    directed_by: 'Kat Coiro and Anu Valia',
    phase: 4,
    saga: 'Multiverse Saga',
    imdb_id: 'tt10857160',
  },
  {
    id: 10,
    title: 'The Guardians of the Galaxy Holiday Special',
    overview:
      'Star-Lord, Drax, Rocket, Mantis, and Groot engage in some spirited shenanigans in an all-new original special created for Disney+.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657230691/mcuapi/gallery/TV%20Shows/The%20Guardians%20of%20the%20Galaxy%20Holiday%20Special/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 0,
    phase: 4,
    directed_by: 'James Gunn',
    imdb_id: 'tt13623136',
  },
  {
    id: 11,
    title: 'Secret Invasion',
    overview:
      'Secret Invasion stars Samuel L. Jackson as Nick Fury and Ben Mendelsohn as the Skrull Talos—characters who first met in Captain Marvel. They are joined by Kingsley Ben-Adir, Emilia Clarke, and Olivia Colman. The crossover event series showcases a faction of shapeshifting Skrulls who have been infiltrating Earth for year',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657230406/mcuapi/gallery/TV%20Shows/Secret%20Invasion/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 6,
    phase: 5,
    saga: 'Multiverse Saga',
    directed_by: 'Thomas Bezucha and Ali Selim',
    imdb_id: 'tt13157618',
  },
  {
    id: 12,
    title: 'Echo',
    overview:
      'Streaming exclusively on Disney, the origin story of Echo revisits Maya Lopez, whose ruthless behavior in New York City catches up with her in her hometown. She must face her past, reconnect with her Native American roots and embrace the meaning of family and community if she ever hopes to move forward.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657230760/mcuapi/gallery/TV%20Shows/Echo/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 0,
    phase: 5,
    saga: 'Multiverse Saga',
    directed_by: 'Sydney Freeland and Catriona McKenzie',
    imdb_id: 'tt13966962',
  },
  // {
  //   id: 13,
  //   title: 'Loki',
  //   overview:
  //     'In Marvel Studios’ "Loki" the mercurial villain Loki (Tom Hiddleston) resumes his role as the God of Mischief in a new series that takes place after the events of “Avengers: Endgame.” Kate Herron directs and Michael Waldron is head writer. Debuts on Disney+ in June 9, 2021.',
  //   cover_url:
  //     'https://raw.githubusercontent.com/AugustoMarcelo/mcuapi/master/covers/loki.jpg',
  //   trailer_url:
  //     'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215507931001',
  //   number_seasons: 1,
  //   number_episodes: 6,
  //   release_date: new Date(2021, 5, 9),
  //   last_aired_date: new Date(2021, 6, 14),
  //   directed_by: 'Kate Herron',
  //   phase: 4,
  //   saga: 'Multiverse Saga',
  //   imdb_id: 'tt9140554',
  // },
  {
    id: 14,
    title: 'Ironheart',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657230537/mcuapi/gallery/TV%20Shows/Ironheart/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 6,
    phase: 5,
    saga: 'Multiverse Saga',
    directed_by: 'Sam Bailey and Angela Barnes',
    imdb_id: 'tt13623126',
  },
  {
    id: 15,
    title: 'Agatha: Coven of Chaos',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1658749561/mcuapi/gallery/TV%20Shows/agatha_coven_of_chaos/posters/1.jpg',
    number_seasons: 1,
    number_episodes: 0,
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt15571732',
  },
  {
    id: 16,
    title: 'Daredevil: Born Again',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1658749734/mcuapi/gallery/TV%20Shows/daredevil_born_again/posters/1.jpg',
    number_seasons: 1,
    number_episodes: 18,
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt20411934',
  },
  {
    id: 17,
    title: 'Armor Wars',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1657230603/mcuapi/gallery/TV%20Shows/Armor%20Wars/Posters/1.jpg',
    number_seasons: 1,
    number_episodes: 0,
    phase: 4,
    imdb_id: 'tt13623128',
  },
];

export default tvshows;
