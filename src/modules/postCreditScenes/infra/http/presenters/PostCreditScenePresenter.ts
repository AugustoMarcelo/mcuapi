import IPostCreditScene from '@modules/postCreditScenes/entities/IPostCreditScene';
import {
  IResourceLinks,
  WithLinks,
  buildPaginationLinks,
} from '@shared/infra/http/hateoas';

interface IPresentPostCreditSceneCollectionParams {
  data: IPostCreditScene[];
  total: number;
  page?: number | string;
  limit?: number | string;
  baseUrl: string;
  path: string;
  query: Record<string, unknown>;
}

interface IPresentPostCreditSceneCollectionResult {
  data: Array<WithLinks<IPostCreditScene>>;
  total: number;
  page: number;
  limit?: number;
  _links: IResourceLinks;
}

export function presentPostCreditScene(
  postCreditScene: IPostCreditScene,
  baseUrl: string,
): WithLinks<IPostCreditScene> {
  const _links: IResourceLinks = {};

  if (postCreditScene.id != null) {
    _links.self = {
      href: `${baseUrl}/api/v1/post-credit-scenes/${postCreditScene.id}`,
    };
  }

  if (postCreditScene.movie_id != null) {
    _links.movie = {
      href: `${baseUrl}/api/v1/movies/${postCreditScene.movie_id}`,
    };
  }

  if (postCreditScene.tvshow_id != null) {
    _links.tvshow = {
      href: `${baseUrl}/api/v1/tvshows/${postCreditScene.tvshow_id}`,
    };
  }

  if (postCreditScene.teases_movie_id != null) {
    _links.teases = {
      href: `${baseUrl}/api/v1/movies/${postCreditScene.teases_movie_id}`,
    };
  } else if (postCreditScene.teases_tvshow_id != null) {
    _links.teases = {
      href: `${baseUrl}/api/v1/tvshows/${postCreditScene.teases_tvshow_id}`,
    };
  }

  return { ...postCreditScene, _links };
}

export function presentPostCreditSceneArray(
  postCreditScenes: IPostCreditScene[],
  baseUrl: string,
): Array<WithLinks<IPostCreditScene>> {
  return postCreditScenes.map(postCreditScene =>
    presentPostCreditScene(postCreditScene, baseUrl),
  );
}

export function presentPostCreditSceneCollection({
  data,
  total,
  page,
  limit,
  baseUrl,
  path,
  query,
}: IPresentPostCreditSceneCollectionParams): IPresentPostCreditSceneCollectionResult {
  const { _links, meta } = buildPaginationLinks({
    baseUrl,
    path,
    query,
    page,
    limit,
    total,
  });

  return {
    data: data.map(postCreditScene =>
      presentPostCreditScene(postCreditScene, baseUrl),
    ),
    total,
    ...meta,
    _links,
  };
}
