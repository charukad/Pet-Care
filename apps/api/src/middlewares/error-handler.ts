import type { NextFunction, Request, Response } from "express";

type AppError = Error & {
  statusCode?: number;
};

export function errorHandler(
  error: AppError,
  _request: Request,
  response: Response,
  _next: NextFunction,
) {
  const statusCode = error.statusCode ?? 500;

  response.status(statusCode).json({
    success: false,
    message: error.message || "Unexpected server error.",
  });
}
