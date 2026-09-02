import { Request, Response } from 'express';
import { container } from 'tsyringe';

import ListAllPostCreditScenesService from '@modules/postCreditScenes/services/ListAllPostCreditScenesService';
import ShowPostCreditSceneService from '@modules/postCreditScenes/services/ShowPostCreditSceneService';
import GetPostCreditScenesByMovieService from '@modules/postCreditScenes/services/GetPostCreditScenesByMovieService';
import GetPostCreditScenesByTVShowService from '@modules/postCreditScenes/services/GetPostCreditScenesByTVShowService';
import {
  presentPostCreditScene,
  presentPostCreditSceneArray,
  presentPostCreditSceneCollection,
} from '@modules/postCreditScenes/infra/http/presenters/PostCreditScenePresenter';
import { getBaseUrl } from '@shared/infra/http/hateoas';
import {
  resolveLimit,
  resolvePage,
  resolvePositiveInteger,
} from '@shared/infra/http/pagination';
import {
  resolveColumns,
  resolveFilter,
  resolveOrder,
} from '@shared/infra/http/listParams';
import POST_CREDIT_SCENE_COLUMNS from '@modules/postCreditScenes/entities/postCreditSceneColumns';

interface IRequestQuery {
  columns?: string;
  order?: string;
  filter?: string;
}

export default class PostCreditScenesController {
  public async index(request: Request, response: Response): Promise<Response> {
    const { columns, order, filter }: IRequestQuery = request.query;

    const page = resolvePage(request.query.page);
    const limit = resolveLimit(request.query.limit);

    const listAllPostCreditScenes = container.resolve(
      ListAllPostCreditScenesService,
    );
    const { data, total } = await listAllPostCreditScenes.execute({
      page,
      limit,
      columns: resolveColumns(columns, POST_CREDIT_SCENE_COLUMNS),
      order: resolveOrder(order, POST_CREDIT_SCENE_COLUMNS),
      filter: resolveFilter(filter, POST_CREDIT_SCENE_COLUMNS),
    });

    return response.status(200).json(
      presentPostCreditSceneCollection({
        data,
        total,
        page,
        limit,
        baseUrl: getBaseUrl(request),
        path: request.baseUrl + request.path,
        query: request.query,
      }),
    );
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { post_credit_scene_id } = request.params;

    const showPostCreditScene = container.resolve(ShowPostCreditSceneService);

    const postCreditScene = await showPostCreditScene.execute({
      post_credit_scene_id: resolvePositiveInteger({
        value: post_credit_scene_id,
        name: 'post_credit_scene_id',
      }),
    });

    return response
      .status(200)
      .json(presentPostCreditScene(postCreditScene, getBaseUrl(request)));
  }

  public async getByMovie(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { movie_id } = request.params;

    const getPostCreditScenesByMovie = container.resolve(
      GetPostCreditScenesByMovieService,
    );
    const postCreditScenes = await getPostCreditScenesByMovie.execute(
      resolvePositiveInteger({ value: movie_id, name: 'movie_id' }),
    );

    return response
      .status(200)
      .json(presentPostCreditSceneArray(postCreditScenes, getBaseUrl(request)));
  }

  public async getByTVShow(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { tvshow_id } = request.params;

    const getPostCreditScenesByTVShow = container.resolve(
      GetPostCreditScenesByTVShowService,
    );
    const postCreditScenes = await getPostCreditScenesByTVShow.execute(
      resolvePositiveInteger({ value: tvshow_id, name: 'tvshow_id' }),
    );

    return response
      .status(200)
      .json(presentPostCreditSceneArray(postCreditScenes, getBaseUrl(request)));
  }
}
