import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { HttpError } from "../utils/http-error";

export function validateBody<T>(schema: ZodType<T>) {
  return function validateRequestBody(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    const result = schema.safeParse(request.body);

    if (!result.success) {
      const firstIssue = result.error.issues[0];
      next(new HttpError(400, firstIssue?.message ?? "Invalid request body."));
      return;
    }

    request.body = result.data;
    next();
  };
}
