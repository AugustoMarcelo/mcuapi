import { NextFunction, Request, RequestHandler, Response } from 'express';

import {
  ColumnAllowList,
  resolveBoolean,
  resolveColumns,
  resolveFilter,
  resolveOrder,
  resolveString,
} from './listParams';
import {
  resolveLimit,
  resolvePage,
  resolvePositiveInteger,
} from './pagination';
import AppError from '@shared/errors/AppError';

interface ListQueryValidation<T extends string> {
  allowList?: ColumnAllowList<T>;
  fields?: readonly string[];
  allowType?: boolean;
  allowBoolean?: boolean;
  allowPagination?: boolean;
}

interface QueryValidation {
  fields?: readonly string[];
}

export function validatePositiveIntegerParam(name: string): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      request.params[name] = String(
        resolvePositiveInteger({ value: request.params[name], name }),
      );
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery({
  fields = [],
}: QueryValidation = {}): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      Object.keys(request.query).forEach(field => {
        if (!fields.includes(field)) {
          throw new AppError(`Unsupported query parameter: ${field}`);
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateListQuery<T extends string>({
  allowList,
  fields = [],
  allowType = false,
  allowBoolean = false,
  allowPagination = true,
}: ListQueryValidation<T>): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction) => {
    try {
      const query = request.query as Record<string, unknown>;
      const allowed = new Set([
        ...(allowPagination ? ['page', 'limit'] : []),
        ...(allowList ? ['columns', 'order', 'filter'] : []),
        ...(allowBoolean ? ['is_mcu'] : []),
        ...(allowType ? ['type'] : []),
        ...fields,
      ]);

      Object.keys(query).forEach(field => {
        if (!allowed.has(field)) {
          throw new AppError(`Unsupported query parameter: ${field}`);
        }
      });

      if (allowPagination) {
        resolvePage(query.page);
        resolveLimit(query.limit);
      }

      if (allowList) {
        resolveColumns(query.columns, allowList);
        resolveOrder(query.order, allowList);
        resolveFilter(query.filter, allowList);
      }

      if (allowBoolean) {
        resolveBoolean(query.is_mcu);
      }

      if (allowType && query.type !== undefined) {
        if (query.type !== 'movie' && query.type !== 'tvshow') {
          throw new AppError('type must be movie or tvshow');
        }
      }

      fields.forEach(field => {
        if (query[field] !== undefined) {
          resolveString({ value: query[field], name: field });
        }
      });

      next();
    } catch (error) {
      next(error);
    }
  };
}
