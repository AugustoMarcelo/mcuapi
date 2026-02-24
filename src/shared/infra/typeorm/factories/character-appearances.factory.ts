import ICharacterAppearance from '@modules/characters/entities/ICharacterAppearance';

// Character appearances based on mcu_characters.json
const characterAppearances: ICharacterAppearance[] = [
  // Iron Man appearances
  { character_id: 1, movie_id: 1, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Iron Man
  { character_id: 1, movie_id: 2, tvshow_id: undefined, role_type: 'cameo' }, // Tony Stark in The Incredible Hulk
  { character_id: 1, movie_id: 3, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Iron Man 2
  { character_id: 1, movie_id: 6, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in The Avengers
  { character_id: 1, movie_id: 7, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Iron Man 3
  { character_id: 1, movie_id: 11, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Avengers: Age of Ultron
  { character_id: 1, movie_id: 13, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Captain America: Civil War
  { character_id: 1, movie_id: 16, tvshow_id: undefined, role_type: 'cameo' }, // Tony Stark in Spider-Man: Homecoming
  { character_id: 1, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Avengers: Infinity War
  { character_id: 1, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Tony Stark in Avengers: Endgame

  // Captain America appearances
  { character_id: 2, movie_id: 5, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Captain America: The First Avenger
  { character_id: 2, movie_id: 6, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in The Avengers
  { character_id: 2, movie_id: 9, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Captain America: The Winter Soldier
  { character_id: 2, movie_id: 11, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Avengers: Age of Ultron
  { character_id: 2, movie_id: 13, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Captain America: Civil War
  { character_id: 2, movie_id: 16, tvshow_id: undefined, role_type: 'cameo' }, // Steve Rogers in Spider-Man: Homecoming
  { character_id: 2, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Avengers: Infinity War
  { character_id: 2, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Steve Rogers in Avengers: Endgame

  // Thor appearances
  { character_id: 3, movie_id: 4, tvshow_id: undefined, role_type: 'main' }, // Thor in Thor
  { character_id: 3, movie_id: 6, tvshow_id: undefined, role_type: 'main' }, // Thor in The Avengers
  { character_id: 3, movie_id: 8, tvshow_id: undefined, role_type: 'main' }, // Thor in Thor: The Dark World
  { character_id: 3, movie_id: 11, tvshow_id: undefined, role_type: 'main' }, // Thor in Avengers: Age of Ultron
  { character_id: 3, movie_id: 14, tvshow_id: undefined, role_type: 'cameo' }, // Thor in Doctor Strange
  { character_id: 3, movie_id: 17, tvshow_id: undefined, role_type: 'main' }, // Thor in Thor: Ragnarok
  { character_id: 3, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Thor in Avengers: Infinity War
  { character_id: 3, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Thor in Avengers: Endgame
  { character_id: 3, movie_id: 29, tvshow_id: undefined, role_type: 'main' }, // Thor in Thor: Love and Thunder

  // Spider-Man appearances
  { character_id: 13, movie_id: 13, tvshow_id: undefined, role_type: 'supporting' }, // Peter Parker in Captain America: Civil War
  { character_id: 13, movie_id: 16, tvshow_id: undefined, role_type: 'main' }, // Peter Parker in Spider-Man: Homecoming
  { character_id: 13, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Peter Parker in Avengers: Infinity War
  { character_id: 13, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Peter Parker in Avengers: Endgame
  { character_id: 13, movie_id: 23, tvshow_id: undefined, role_type: 'main' }, // Peter Parker in Spider-Man: Far From Home
  { character_id: 13, movie_id: 27, tvshow_id: undefined, role_type: 'main' }, // Peter Parker in Spider-Man: No Way Home

  // Doctor Strange appearances
  { character_id: 30, movie_id: 14, tvshow_id: undefined, role_type: 'main' }, // Stephen Strange in Doctor Strange
  { character_id: 30, movie_id: 17, tvshow_id: undefined, role_type: 'cameo' }, // Stephen Strange in Thor: Ragnarok
  { character_id: 30, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Stephen Strange in Avengers: Infinity War
  { character_id: 30, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Stephen Strange in Avengers: Endgame
  { character_id: 30, movie_id: 27, tvshow_id: undefined, role_type: 'main' }, // Stephen Strange in Spider-Man: No Way Home
  { character_id: 30, movie_id: 28, tvshow_id: undefined, role_type: 'main' }, // Stephen Strange in Doctor Strange in the Multiverse of Madness

  // Black Panther appearances
  { character_id: 35, movie_id: 13, tvshow_id: undefined, role_type: 'supporting' }, // T'Challa in Captain America: Civil War
  { character_id: 35, movie_id: 18, tvshow_id: undefined, role_type: 'main' }, // T'Challa in Black Panther
  { character_id: 35, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // T'Challa in Avengers: Infinity War
  { character_id: 35, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // T'Challa in Avengers: Endgame

  // Captain Marvel appearances
  { character_id: 39, movie_id: 21, tvshow_id: undefined, role_type: 'main' }, // Carol Danvers in Captain Marvel
  { character_id: 39, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Carol Danvers in Avengers: Endgame
  { character_id: 39, movie_id: 33, tvshow_id: undefined, role_type: 'main' }, // Carol Danvers in The Marvels

  // Ant-Man appearances
  { character_id: 42, movie_id: 12, tvshow_id: undefined, role_type: 'main' }, // Scott Lang in Ant-Man
  { character_id: 42, movie_id: 13, tvshow_id: undefined, role_type: 'supporting' }, // Scott Lang in Captain America: Civil War
  { character_id: 42, movie_id: 20, tvshow_id: undefined, role_type: 'main' }, // Scott Lang in Ant-Man and the Wasp
  { character_id: 42, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Scott Lang in Avengers: Endgame
  { character_id: 42, movie_id: 31, tvshow_id: undefined, role_type: 'main' }, // Scott Lang in Ant-Man and the Wasp: Quantumania

  // Loki appearances
  { character_id: 46, movie_id: 4, tvshow_id: undefined, role_type: 'main' }, // Loki in Thor
  { character_id: 46, movie_id: 6, tvshow_id: undefined, role_type: 'main' }, // Loki in The Avengers
  { character_id: 46, movie_id: 8, tvshow_id: undefined, role_type: 'main' }, // Loki in Thor: The Dark World
  { character_id: 46, movie_id: 17, tvshow_id: undefined, role_type: 'main' }, // Loki in Thor: Ragnarok
  { character_id: 46, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Loki in Avengers: Infinity War
  { character_id: 46, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Loki in Avengers: Endgame

  // Scarlet Witch appearances
  { character_id: 47, movie_id: 9, tvshow_id: undefined, role_type: 'cameo' }, // Wanda Maximoff in Captain America: The Winter Soldier
  { character_id: 47, movie_id: 11, tvshow_id: undefined, role_type: 'main' }, // Wanda Maximoff in Avengers: Age of Ultron
  { character_id: 47, movie_id: 13, tvshow_id: undefined, role_type: 'main' }, // Wanda Maximoff in Captain America: Civil War
  { character_id: 47, movie_id: 19, tvshow_id: undefined, role_type: 'main' }, // Wanda Maximoff in Avengers: Infinity War
  { character_id: 47, movie_id: 22, tvshow_id: undefined, role_type: 'main' }, // Wanda Maximoff in Avengers: Endgame
  { character_id: 47, movie_id: 28, tvshow_id: undefined, role_type: 'main' }, // Wanda Maximoff in Doctor Strange in the Multiverse of Madness

  // TV Show appearances
  { character_id: 47, movie_id: undefined, tvshow_id: 1, role_type: 'main' }, // Wanda Maximoff in WandaVision
  { character_id: 49, movie_id: undefined, tvshow_id: 1, role_type: 'main' }, // Agatha Harkness in WandaVision
  { character_id: 49, movie_id: undefined, tvshow_id: 16, role_type: 'main' }, // Agatha Harkness in Agatha All Along
  { character_id: 41, movie_id: undefined, tvshow_id: 7, role_type: 'main' }, // Kamala Khan in Ms. Marvel
  { character_id: 73, movie_id: undefined, tvshow_id: 5, role_type: 'main' }, // Kate Bishop in Hawkeye
  { character_id: 74, movie_id: undefined, tvshow_id: 5, role_type: 'main' }, // Yelena Belova in Hawkeye
  { character_id: 76, movie_id: undefined, tvshow_id: 9, role_type: 'main' }, // Jennifer Walters in She-Hulk: Attorney at Law
  { character_id: 77, movie_id: undefined, tvshow_id: 6, role_type: 'main' }, // Marc Spector in Moon Knight
  { character_id: 78, movie_id: undefined, tvshow_id: 6, role_type: 'main' }, // Layla El-Faouly in Moon Knight
  { character_id: 68, movie_id: undefined, tvshow_id: 5, role_type: 'main' }, // Wilson Fisk in Hawkeye
  { character_id: 68, movie_id: undefined, tvshow_id: 13, role_type: 'main' }, // Wilson Fisk in Echo
  { character_id: 67, movie_id: undefined, tvshow_id: 9, role_type: 'cameo' }, // Matt Murdock in She-Hulk: Attorney at Law
  { character_id: 67, movie_id: undefined, tvshow_id: 17, role_type: 'main' }, // Matt Murdock in Daredevil: Born Again
];

export default characterAppearances; 
