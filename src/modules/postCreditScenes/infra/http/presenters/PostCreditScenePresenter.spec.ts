import {
  presentPostCreditScene,
  presentPostCreditSceneArray,
  presentPostCreditSceneCollection,
} from './PostCreditScenePresenter';
import IPostCreditScene from '@modules/postCreditScenes/entities/IPostCreditScene';

const baseUrl = 'http://localhost:3333';

const postCreditScene: IPostCreditScene = {
  id: 1,
  movie_id: 1,
  description: 'Nick Fury reveals the Avengers Initiative.',
  teases_movie_id: 2,
  is_stinger: false,
};

describe('PostCreditScenePresenter', () => {
  it('Should add self, movie and teases links', () => {
    const presented = presentPostCreditScene(postCreditScene, baseUrl);

    expect(presented._links.self).toEqual({
      href: `${baseUrl}/api/v1/post-credit-scenes/1`,
    });
    expect(presented._links.movie).toEqual({
      href: `${baseUrl}/api/v1/movies/1`,
    });
    expect(presented._links.teases).toEqual({
      href: `${baseUrl}/api/v1/movies/2`,
    });
    expect(presented._links.tvshow).toBeUndefined();
  });

  it('Should add a tvshow link when the scene belongs to a tvshow', () => {
    const tvshowScene: IPostCreditScene = {
      id: 2,
      tvshow_id: 5,
      description: 'A tease for the next season.',
      teases_tvshow_id: 6,
      is_stinger: true,
    };

    const presented = presentPostCreditScene(tvshowScene, baseUrl);

    expect(presented._links.tvshow).toEqual({
      href: `${baseUrl}/api/v1/tvshows/5`,
    });
    expect(presented._links.teases).toEqual({
      href: `${baseUrl}/api/v1/tvshows/6`,
    });
    expect(presented._links.movie).toBeUndefined();
  });

  it('Should skip the teases link when the scene teases nothing', () => {
    const untargetedScene: IPostCreditScene = {
      id: 3,
      movie_id: 1,
      description: 'A joke with no setup for a future title.',
      is_stinger: false,
    };

    const presented = presentPostCreditScene(untargetedScene, baseUrl);

    expect(presented._links.teases).toBeUndefined();
  });

  it('Should skip id-dependent links when id is missing', () => {
    const presented = presentPostCreditScene(
      { description: 'No ID' } as IPostCreditScene,
      baseUrl,
    );

    expect(presented._links.self).toBeUndefined();
  });

  it('Should present an array of post-credit scenes', () => {
    const presented = presentPostCreditSceneArray([postCreditScene], baseUrl);

    expect(presented).toHaveLength(1);
    expect(presented[0]._links.self).toEqual({
      href: `${baseUrl}/api/v1/post-credit-scenes/1`,
    });
  });

  it('Should wrap a collection with pagination links and meta', () => {
    const presented = presentPostCreditSceneCollection({
      data: [postCreditScene],
      total: 1,
      page: 1,
      limit: 10,
      baseUrl,
      path: '/api/v1/post-credit-scenes',
      query: {},
    });

    expect(presented.data).toHaveLength(1);
    expect(presented.total).toBe(1);
    expect(presented.page).toBe(1);
    expect(presented._links.self).toBeDefined();
  });
});
