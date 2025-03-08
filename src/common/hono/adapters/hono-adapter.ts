import { type HttpBindings, createAdaptorServer } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { RESPONSE_ALREADY_SENT } from "@hono/node-server/utils/response";
import { HttpStatus, Logger, RequestMethod } from "@nestjs/common";
import type {
  ErrorHandler,
  NestApplicationOptions,
  RequestHandler,
} from "@nestjs/common/interfaces";
import { AbstractHttpAdapter } from "@nestjs/core/adapters/http-adapter.js";
import { type Context, Hono, type Next } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import type { RedirectStatusCode, StatusCode } from "hono/utils/http-status";
import { Buffer } from "node:buffer";
import * as http from "node:http";
import type { Http2SecureServer, Http2Server } from "node:http2";
import * as https from "node:https";
import type { HonoRequest, TypeBodyParser } from "../interfaces";

type HonoHandler = RequestHandler<HonoRequest, Context>;

type ServerType = http.Server | Http2Server | Http2SecureServer;

/**
 * Adapter for using Hono with NestJS.
 */
export class HonoAdapter extends AbstractHttpAdapter<
  ServerType,
  HonoRequest,
  Context
> {
  protected declare readonly instance: Hono<{ Bindings: HttpBindings }>;
  private _isParserRegistered: boolean | undefined;

  constructor() {
    super(new Hono());
  }

  get isParserRegistered(): boolean {
    return !!this._isParserRegistered;
  }

  private getRouteAndHandler(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ): [string, HonoHandler] {
    const p = typeof pathOrHandler === "function" ? "" : pathOrHandler;
    const h = typeof pathOrHandler === "function" ? pathOrHandler : handler;
    if (!h) {
      throw new Error("Handler is required");
    }

    return [p, h];
  }

  private createRouteHandler(routeHandler: HonoHandler) {
    return async (ctx: Context, next: Next) => {
      (ctx.req as any).params = ctx.req.param();
      // @ts-expect-error
      ctx.type = (t: string) => {
        this.setHeader(ctx, "Content-Type", t);
      };

      // @ts-expect-error
      ctx.send = (body: unknown) => {
        ctx.set("body", body);
      };

      await routeHandler(ctx.req, ctx, next);
      return this.send(ctx);
    };
  }

  private send(ctx: Context) {
    const body = ctx.get("body");
    return typeof body === "object" ? ctx.json(body) : ctx.body(body);
  }

  public override get(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.get(routePath, this.createRouteHandler(routeHandler));
  }

  public override post(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.post(routePath, this.createRouteHandler(routeHandler));
  }

  public override put(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.put(routePath, this.createRouteHandler(routeHandler));
  }

  public override delete(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.delete(routePath, this.createRouteHandler(routeHandler));
  }

  public override use(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.use(routePath, this.createRouteHandler(routeHandler));
  }

  public override patch(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.patch(routePath, this.createRouteHandler(routeHandler));
  }

  public override options(
    pathOrHandler: string | HonoHandler,
    handler?: HonoHandler
  ) {
    const [routePath, routeHandler] = this.getRouteAndHandler(
      pathOrHandler,
      handler
    );
    this.instance.options(routePath, this.createRouteHandler(routeHandler));
  }

  public reply(ctx: Context, body: any, statusCode?: StatusCode) {
    if (statusCode) ctx.status(statusCode);

    const responseContentType = this.getHeader(ctx, "Content-Type");
    if (
      !responseContentType?.startsWith("application/json") &&
      body?.statusCode >= HttpStatus.BAD_REQUEST
    ) {
      this.setHeader(ctx, "Content-Type", "application/json");
    }
    ctx.set("body", body);
  }

  public status(ctx: Context, statusCode: StatusCode) {
    ctx.status(statusCode);
  }

  public end() {
    return RESPONSE_ALREADY_SENT;
  }

  public render(_response: never, _view: string, _options: never) {
    throw new Error("Method not implemented.");
  }

  public redirect(ctx: Context, statusCode: RedirectStatusCode, url: string) {
    ctx.redirect(url, statusCode);
  }

  public setErrorHandler(handler: ErrorHandler) {
    this.instance.onError(async (err: Error, ctx: Context) => {
      await handler(err, ctx.req, ctx);
      return this.send(ctx);
    });
  }

  public setNotFoundHandler(handler: RequestHandler) {
    this.instance.notFound(async (ctx: Context) => {
      await handler(ctx.req, ctx);
      return this.send(ctx);
    });
  }

  public useStaticAssets(
    path: string,
    options: Parameters<typeof serveStatic>[0]
  ) {
    Logger.log("Registering static assets middleware");
    this.instance.use(path, serveStatic(options));
  }

  public setViewEngine(_options: never | string) {
    throw new Error("Method not implemented.");
  }

  public isHeadersSent(_ctx: Context): boolean {
    return true;
  }

  public getHeader(ctx: Context, name: string) {
    return ctx.req.header(name);
  }

  public setHeader(ctx: Context, name: string, value: string) {
    ctx.header(name, value);
  }

  public appendHeader(ctx: Context, name: string, value: string) {
    ctx.res.headers.append(name, value);
  }

  public getRequestHostname(ctx: Context): string {
    return ctx.req.header().host;
  }

  public getRequestMethod(request: HonoRequest): string {
    return request.method;
  }

  public getRequestUrl(request: HonoRequest): string {
    return request.url;
  }

  public enableCors(options: never) {
    this.instance.use(cors(options));
  }

  public useBodyParser(
    type: TypeBodyParser,
    _rawBody?: boolean,
    bodyLimit?: number
  ) {
    Logger.log(
      `Registering body parser middleware for type: ${type} | bodyLimit: ${bodyLimit}`
    );

    if (bodyLimit) {
      this.instance.use(this.bodyLimit(bodyLimit));
    }

    // To avoid the Nest application init to override our custom
    // body parser, we mark the parsers as registered.
    this._isParserRegistered = true;
  }

  public close(): Promise<void> {
    return new Promise((resolve) => this.httpServer.close(() => resolve()));
  }

  public initHttpServer(options: NestApplicationOptions) {
    this.instance.use(async (ctx, next) => {
      const req = ctx.req as any;
      req.ip =
        ctx.req.header("cf-connecting-ip") ??
        ctx.req.header("x-forwarded-for") ??
        ctx.req.header("x-real-ip") ??
        ctx.req.header("forwarded") ??
        ctx.req.header("true-client-ip") ??
        ctx.req.header("x-client-ip") ??
        ctx.req.header("x-cluster-client-ip") ??
        ctx.req.header("x-forwarded") ??
        ctx.req.header("forwarded-for") ??
        ctx.req.header("via");
      ctx.req.query = ctx.req.query() as never;
      req.headers = Object.fromEntries(ctx.req.raw.headers as never);

      const contentType = ctx.req.header("content-type");

      if (
        contentType?.startsWith("multipart/form-data") ||
        contentType?.startsWith("application/x-www-form-urlencoded")
      ) {
        req.body = await ctx.req.parseBody({
          all: true,
        });
      } else if (
        contentType?.startsWith("application/json") ||
        contentType?.startsWith("text/plain")
      ) {
        if (options.rawBody) {
          req.rawBody = Buffer.from(await ctx.req.text());
        }
        req.body = await ctx.req.json();
      }

      return next();
    });
    const isHttpsEnabled = options?.httpsOptions;
    const createServer = isHttpsEnabled
      ? https.createServer
      : http.createServer;
    this.httpServer = createAdaptorServer({
      fetch: this.instance.fetch,
      createServer,
      overrideGlobalObjects: false,
    });
  }

  public getType(): string {
    return "hono";
  }

  public registerParserMiddleware(_prefix?: string, rawBody?: boolean) {
    if (this._isParserRegistered) {
      return;
    }

    Logger.log("Registering parser middleware");
    this.useBodyParser("application/x-www-form-urlencoded", rawBody);
    this.useBodyParser("application/json", rawBody);
    this.useBodyParser("text/plain", rawBody);

    this._isParserRegistered = true;
  }

  public createMiddlewareFactory(requestMethod: RequestMethod) {
    return (path: string, callback: Function) => {
      const routeMethodsMap = {
        [RequestMethod.ALL]: this.instance.all,
        [RequestMethod.DELETE]: this.instance.delete,
        [RequestMethod.GET]: this.instance.get,
        [RequestMethod.OPTIONS]: this.instance.options,
        [RequestMethod.PATCH]: this.instance.patch,
        [RequestMethod.POST]: this.instance.post,
        [RequestMethod.PUT]: this.instance.put,
      };

      const routeMethod = (
        (routeMethodsMap[requestMethod as never] as typeof this.instance.get) ||
        this.instance.get
      ).bind(this.instance);
      routeMethod(path, async (ctx: Context, next: Next) => {
        await callback(ctx.req, ctx, next);
      });
    };
  }

  public applyVersionFilter(): () => () => never {
    throw new Error("Versioning not yet supported in Hono");
  }

  public override listen(port: string | number, ...args: never[]): ServerType {
    return this.httpServer.listen(port, ...args);
  }

  public bodyLimit(maxSize: number) {
    return bodyLimit({
      maxSize,
      onError: () => {
        throw new Error("Body too large");
      },
    });
  }
}
