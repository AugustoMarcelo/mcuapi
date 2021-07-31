function generateRelatedMovies(movie_id: number, related_movies: number[]) {
  return related_movies.map(movie => ({
    movie_id,
    related_movie_id: movie,
  }));
}

const ironMan = generateRelatedMovies(1, [3, 6, 7, 11, 13, 16, 19, 22]);
const hulk = generateRelatedMovies(2, [1]);
const ironMan2 = generateRelatedMovies(3, [3, 6, 7, 11, 13, 16, 19, 22]);
const thor = generateRelatedMovies(4, [6, 8, 11, 17, 19]);
const captainAmerica = generateRelatedMovies(5, [6, 9, 11, 13, 19, 22]);
const avengers = generateRelatedMovies(6, [1, 2, 3, 4, 5, 11, 19, 22]);
const ironMan3 = generateRelatedMovies(7, [1, 2, 6, 11, 13, 16, 19, 22]);
const thor2 = generateRelatedMovies(8, [4, 6, 11, 17, 19]);
const captainAmerica2 = generateRelatedMovies(9, [5, 6, 11, 13, 19]);
const guardiansOfTheGalaxy = generateRelatedMovies(10, [15, 19, 22]);
const avengers2 = generateRelatedMovies(11, [1, 2, 3, 4, 5, 6, 7, 8, 9, 19]);
const antMan = generateRelatedMovies(12, [13, 19, 20, 22]);
const captainAmerica3 = generateRelatedMovies(13, [
  5,
  6,
  9,
  11,
  12,
  16,
  18,
  19,
]);
const doctorStrange = generateRelatedMovies(14, [17, 19, 22, 28]);
const guardiansOfTheGalaxy2 = generateRelatedMovies(15, [10, 19]);
const spiderMan = generateRelatedMovies(16, [13, 19, 23]);
const thor3 = generateRelatedMovies(17, [4, 6, 8, 11, 19]);
const blackPanther = generateRelatedMovies(18, [13, 19, 22]);
const avengers3 = generateRelatedMovies(19, [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
]);
const antMan2 = generateRelatedMovies(20, [12, 13]);
const captainMarvel = generateRelatedMovies(21, [19, 22]);
const avengers4 = generateRelatedMovies(22, [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  23,
]);
const spiderMan2 = generateRelatedMovies(23, [13, 16, 19, 22]);
const blackWidow = generateRelatedMovies(24, [3, 6, 9, 11, 13, 19, 22]);

const relatedMovies = [
  ...ironMan,
  ...hulk,
  ...ironMan2,
  ...thor,
  ...captainAmerica,
  ...avengers,
  ...ironMan3,
  ...thor2,
  ...captainAmerica2,
  ...guardiansOfTheGalaxy,
  ...avengers2,
  ...antMan,
  ...captainAmerica3,
  ...doctorStrange,
  ...guardiansOfTheGalaxy2,
  ...spiderMan,
  ...thor3,
  ...blackPanther,
  ...avengers3,
  ...antMan2,
  ...captainMarvel,
  ...avengers4,
  ...spiderMan2,
  ...blackWidow,
];

export default relatedMovies;
