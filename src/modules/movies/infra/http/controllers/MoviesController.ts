import { Request, Response } from 'express';

export default class MoviesController {
  public async create(rquest: Request, response: Response): Promise<Response> {
    return response.json();
  }
}
