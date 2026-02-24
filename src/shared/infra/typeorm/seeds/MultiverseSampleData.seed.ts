import { Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import Movie from '@modules/movies/infra/typeorm/entities/Movie';
import Character from '@modules/characters/infra/typeorm/entities/Character';

export default class MultiverseSampleData implements Seeder {
  public async run(_: unknown, connection: Connection): Promise<void> {
    // Sample MCU Movies
    const mcuMovies = [
      {
        id: 1001,
        title: 'Iron Man',
        release_date: new Date('2008-05-02'),
        studio: 'Marvel Studios',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        is_mcu: true,
        type: 'movie',
        timeline_universe: 'Earth-616',
        timeline_chronology_order: 1,
        timeline_starts_at: '2008',
        timeline_ends_at: '2008',
        directed_by: 'Jon Favreau',
        phase: 1,
        saga: 'Infinity Saga',
        chronology: 1,
        overview: 'After being held captive in an Afghan cave, billionaire engineer Tony Stark creates a unique weaponized suit of armor to fight evil.',
        cover_url: 'https://example.com/iron-man.jpg',
        trailer_url: 'https://example.com/iron-man-trailer.mp4',
        box_office: 585174222,
        duration: 126,
        post_credit_scenes: 1,
        imdb_id: 'tt0371746',
      },
    ];

    // Sample FOX X-Men Movies
    const foxMovies = [
      {
        id: 2001,
        title: 'X-Men: First Class',
        release_date: new Date('2011-06-03'),
        studio: 'FOX',
        continuity: 'FOX X-Men Universe',
        multiverse_designation: 'Earth-10005',
        is_mcu: false,
        type: 'movie',
        timeline_universe: 'Earth-10005',
        timeline_chronology_order: 1,
        timeline_starts_at: '1962',
        timeline_ends_at: '1962',
        directed_by: 'Matthew Vaughn',
        phase: 0,
        saga: 'X-Men Saga',
        chronology: 1,
        overview: 'In the 1960s, superpowered humans Charles Xavier and Erik Lensherr work together to find others like them.',
        cover_url: 'https://example.com/xmen-first-class.jpg',
        trailer_url: 'https://example.com/xmen-first-class-trailer.mp4',
        box_office: 353624124,
        duration: 132,
        post_credit_scenes: 1,
        imdb_id: 'tt1270798',
      },
    ];

    // Sample Characters
    const characters = [
      {
        id: 1,
        name: 'Tony Stark',
        alias: 'Iron Man',
        description: 'Genius billionaire playboy philanthropist who created the Iron Man suit.',
        image_url: 'https://example.com/tony-stark.jpg',
        continuity: 'MCU',
        multiverse_designation: 'Earth-616',
        variant_of: undefined,
        first_appearance_movie_id: 1001,
        first_appearance_tvshow_id: undefined,
      },
      {
        id: 2,
        name: 'Charles Xavier',
        alias: 'Professor X',
        description: 'Telepathic mutant and founder of the X-Men.',
        image_url: 'https://example.com/charles-xavier.jpg',
        continuity: 'FOX X-Men Universe',
        multiverse_designation: 'Earth-10005',
        variant_of: undefined,
        first_appearance_movie_id: 2001,
        first_appearance_tvshow_id: undefined,
      },
    ];

    // Insert sample data
    const movieRepository = connection.getRepository(Movie);
    const characterRepository = connection.getRepository(Character);

    // Insert movies
    for (const movie of [...mcuMovies, ...foxMovies]) {
      await movieRepository.save(movie);
    }

    // Insert characters
    for (const character of characters) {
      await characterRepository.save(character);
    }

    console.log('✅ Multiverse sample data seeded successfully!');
  }
} 
