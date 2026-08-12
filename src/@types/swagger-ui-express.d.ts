declare module 'swagger-ui-express' {
  type RequestHandler = import('express').RequestHandler;

  interface JsonObject {
    [key: string]: unknown;
  }

  interface SwaggerUiOptions {
    customCss?: string;
    customCssUrl?: string;
    customfavIcon?: string;
    customJs?: string | string[];
    customSiteTitle?: string;
    explorer?: boolean;
    swaggerOptions?: JsonObject;
    swaggerUrl?: string;
    swaggerUrls?: string[];
  }

  export const serve: RequestHandler[];

  export function setup(
    swaggerDoc?: JsonObject | null,
    opts?: SwaggerUiOptions,
    options?: JsonObject,
    customCss?: string,
    customfavIcon?: string,
    swaggerUrl?: string,
    customSiteTitle?: string,
  ): RequestHandler;
}
