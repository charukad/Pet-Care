import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  const error = new Error(`Route not found: ${request.method} ${request.originalUrl}`);
  (error as Error & { statusCode?: number }).statusCode = 404;
  next(error);
}
