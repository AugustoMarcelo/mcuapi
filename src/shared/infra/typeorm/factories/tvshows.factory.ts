import ITVShow from '@modules/tvshows/entities/ITVShow';

const tvshows: ITVShow[] = [
  {
    id: 1,
    title: 'WandaVision',
    overview:
      'Marvel Studios captivating new series "WandaVision" which premieres in early 2021 on Disney+. Starring Elizabeth Olsen and Paul Bettany, "WandaVision" marks the first series from Marvel Studios streaming exclusively on Disney+. The series is a blend of classic television and the Marvel Cinematic Universe in which Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1676219587/mcuapi/gallery/tv_shows/wandavision/posters/1.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215509803001',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1676219753/mcuapi/gallery/tv_shows/the_falcon_and_the_winter_soldier/posters/1.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215508715001',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1676219908/mcuapi/gallery/tv_shows/loki/season_1/posters/1.jpg',
    trailer_url:
      'https://players.brightcove.net/5359769168001/BJemW31x6g_default/index.html?videoId=6215507931001',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1676220025/mcuapi/gallery/tv_shows/what_if/season_1/posters/1.jpg',
    trailer_url:
      'https://assets.espn.go.com/players/web-player-bundle/next/embed/share.html#id=6262751537001&brand=marvel',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1676220173/mcuapi/gallery/tv_shows/hawkeye/1.jpg',
    trailer_url: 'https://youtu.be/5VYb3B1ETlk',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677417882/mcuapi/gallery/tv_shows/moon_knight/posters/3.jpg',
    trailer_url: 'https://youtu.be/x7Krla_UxRg',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418034/mcuapi/gallery/tv_shows/ms_marvel/posters/1.jpg',
    trailer_url: 'https://youtu.be/m9EX0f6V11Y',
    season: 1,
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
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418157/mcuapi/gallery/tv_shows/i_am_groot/posters/2.jpg',
    season: 1,
    number_episodes: 5,
    release_date: new Date(2022, 7, 10),
    last_aired_date: new Date(2022, 7, 10),
    directed_by: 'Kirsten Lepore',
    phase: 4,
    saga: 'Infinity Saga',
    imdb_id: 'tt13623148',
  },
  {
    id: 9,
    title: 'She Hulk: Attorney at Law',
    overview:
      'She-Hulk: Attorney at Law follows Jennifer Walters as she navigates the complicated life of a single, 30-something attorney who also happens to be a green 6-foot-7-inch superpowered hulk. The nine-episode series welcomes a host of MCU vets, including Mark Ruffalo as Smart Hulk, Tim Roth as Emil Blonsky/the Abomination, and Benedict Wong as Wong.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418342/mcuapi/gallery/tv_shows/she_hulk_attorney_at_law/posters/2.jpg',
    trailer_url: 'https://youtu.be/u7JsKhI2An0',
    season: 1,
    number_episodes: 9,
    release_date: new Date(2022, 7, 18),
    last_aired_date: new Date(2022, 9, 13),
    directed_by: 'Kat Coiro and Anu Valia',
    phase: 4,
    saga: 'Multiverse Saga',
    imdb_id: 'tt10857160',
  },
  {
    id: 10,
    title: 'Werewolf By Night',
    overview:
      'Follows a lycanthrope superhero who fights evil using the abilities given to him by a curse brought on by his bloodline.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418444/mcuapi/gallery/tv_shows/werewolf_by_night/posters/1.jpg',
    trailer_url: 'https://youtu.be/bLEFqhS5WmI',
    season: 1,
    number_episodes: 1,
    release_date: new Date(2022, 9, 7),
    last_aired_date: new Date(2022, 9, 7),
    directed_by: 'Michael Giacchino',
    phase: 4,
    saga: 'Multiverse Saga',
    imdb_id: 'tt15318872',
  },
  {
    id: 11,
    title: 'The Guardians of the Galaxy Holiday Special',
    overview:
      'In the The Guardians of the Galaxy Holiday Special, the Guardians, who are on a mission to make Christmas unforgettable for Quill, head to Earth in search of the perfect present. The Marvel Studios’ Special Presentation stars Chris Pratt, Dave Bautista, Karen Gillan, and Pom Klementieff, featuring Vin Diesel as Groot and Bradley Cooper as Rocket, Sean Gunn and The Old 97’s with Michael Rooker and Kevin Bacon',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418587/mcuapi/gallery/tv_shows/the_guardians_of_the_galaxy_holiday_special/posters/1.jpg',
    trailer_url: 'https://youtu.be/OYhFFQl4fLs',
    season: 1,
    number_episodes: 1,
    release_date: new Date(2022, 10, 25),
    last_aired_date: new Date(2022, 10, 25),
    phase: 4,
    directed_by: 'James Gunn',
    saga: 'Multiverse Saga',
    imdb_id: 'tt13623136',
  },
  {
    id: 12,
    title: 'Secret Invasion',
    release_date: new Date(2023, 5, 21),
    last_aired_date: new Date(2023, 6, 26),
    overview:
      'In Secret Invasion, set in the present-day MCU, Fury learns of a clandestine invasion of Earth by a faction of shapeshifting Skrulls. Fury joins his allies, including Everett Ross, Maria Hill, and the Skrull Talos, who has made a life for himself on Earth. Together they race against time to thwart an imminent Skrull invasion and save humanity.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1680562454/mcuapi/gallery/tv_shows/secret_invasion/posters/2.jpg',
    trailer_url: 'https://youtu.be/Tp_YZNqNBhw',
    season: 1,
    number_episodes: 6,
    phase: 5,
    saga: 'Multiverse Saga',
    directed_by: 'Thomas Bezucha and Ali Selim',
    imdb_id: 'tt13157618',
  },
  {
    id: 13,
    title: 'Echo',
    release_date: new Date(2024, 0, 9),
    last_aired_date: new Date(2024, 0, 9),
    overview:
      'Streaming exclusively on Disney, the origin story of Echo revisits Maya Lopez, whose ruthless behavior in New York City catches up with her in her hometown. She must face her past, reconnect with her Native American roots and embrace the meaning of family and community if she ever hopes to move forward.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677418904/mcuapi/gallery/tv_shows/echo/posters/2.jpg',
    trailer_url: 'https://youtu.be/AFUKnherhuw',
    season: 1,
    number_episodes: 5,
    phase: 5,
    saga: 'Spotlight',
    directed_by: 'Sydney Freeland and Catriona McKenzie',
    imdb_id: 'tt13966962',
  },
  {
    id: 14,
    title: 'Loki',
    overview:
      'Loki Season 2 picks up in the aftermath of the shocking season finale when Loki finds himself in a battle for the soul of the Time Variance Authority. Along with Mobius, Hunter B-15, and a team of new and returning characters, Loki navigates an ever-expanding and increasingly dangerous Multiverse in search of Sylvie, Judge Renslayer, Miss Minutes, and the truth of what it means to possess free will and glorious purpose.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1698754888/mcuapi/gallery/tv_shows/loki/season_2/3.jpg',
    trailer_url: 'https://youtu.be/dug56u8NN7g',
    season: 2,
    number_episodes: 6,
    release_date: new Date(2023, 9, 5),
    last_aired_date: new Date(2023, 10, 9),
    directed_by: 'Kate Herron',
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt9140554',
  },
  {
    id: 15,
    title: 'Ironheart',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677419261/mcuapi/gallery/tv_shows/ironheart/posters/1.jpg',
    season: 1,
    number_episodes: 6,
    phase: 5,
    saga: 'Multiverse Saga',
    directed_by: 'Sam Bailey and Angela Barnes',
    imdb_id: 'tt13623126',
  },
  {
    id: 16,
    title: 'Agatha All Along',
    overview:
      'In Agatha All Along, the infamous Agatha Harkness finds herself down and out of power after a suspicious goth Teen helps break her free from a distorted spell. Her interest is piqued when he begs her to take him on the legendary Witches’ Road, a magical gauntlet of trials that, if survived, rewards a witch with what they’re missing. Together, Agatha and this mysterious Teen pull together a desperate coven, and set off down, down, down The Road…',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1721064409/mcuapi/gallery/tv_shows/agatha_all_along/posters/2.jpg',
    trailer_url: 'https://youtu.be/R9pXbNz6Vbw',
    season: 1,
    number_episodes: 9,
    release_date: new Date(2024, 8, 18),
    last_aired_date: new Date(2024, 10, 6),
    directed_by: 'Jac Schaeffer, Rachel Goldberg and Gandja Montiero',
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt15571732',
  },
  {
    id: 17,
    title: 'Daredevil: Born Again',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1677419390/mcuapi/gallery/tv_shows/daredevil_born_again/posters/1.jpg',
    season: 1,
    number_episodes: 18,
    release_date: new Date(2025, 2, 4),
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt20411934',
  },
  {
    id: 18,
    title: 'I Am Groot',
    overview:
      'The troublemaking twig returns to mischief in the second season of “I Am Groot.” This time, Baby Groot finds himself exploring the universe and beyond aboard the Guardians’ spaceships, coming face-to-face—or nose-to-nose—with new and colorful creatures and environments',
    trailer_url: 'https://youtu.be/1k8H2CywVqg',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1698756081/mcuapi/gallery/tv_shows/i_am_groot/posters/season_2/1.jpg',
    season: 2,
    number_episodes: 5,
    release_date: new Date(2023, 10, 6),
    last_aired_date: new Date(2023, 10, 6),
    directed_by: 'Kirsten Lepore',
    phase: 4,
    saga: 'Infinity Saga',
    imdb_id: 'tt13623148',
  },
  {
    id: 19,
    title: 'What If...?',
    overview:
      'Season 2 of “What If…?” continues the journey as The Watcher guides viewers through the vast multiverse, introducing brand new and familiar faces throughout the MCU. The series questions, revisits and twists classic Marvel Cinematic moments with an incredible voice cast that includes a host of stars who reprise their iconic roles.',
    cover_url:
      'https://res.cloudinary.com/augustomarcelo/image/upload/v1700413035/mcuapi/gallery/tv_shows/what_if/season_2/posters/1.jpg',
    trailer_url: 'https://youtu.be/TiEVqZ2Bc_c',
    season: 2,
    number_episodes: 9,
    release_date: new Date(2023, 11, 22),
    last_aired_date: new Date(2023, 11, 30),
    directed_by: 'Bryan Andrews',
    phase: 5,
    saga: 'Multiverse Saga',
    imdb_id: 'tt10168312',
  },
];

export default tvshows;
