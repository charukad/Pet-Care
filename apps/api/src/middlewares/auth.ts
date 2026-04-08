import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles";
import { getUserById } from "../store/demo-store";
import { HttpError } from "../utils/http-error";
import { verifyAuthToken } from "../utils/jwt";

function getBearerToken(request: Request) {
  const header = request.header("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  return header.replace("Bearer ", "").trim();
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const token = getBearerToken(request);

    if (!token) {
      throw new HttpError(401, "Authentication token is required.");
    }

    const payload = verifyAuthToken(token);
    const user = getUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new HttpError(401, "Authenticated user could not be found.");
    }

    request.user = user;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired authentication token."));
  }
}

export function requireRoles(...allowedRoles: Role[]) {
  return function checkRole(
    request: Request,
    _response: Response,
    next: NextFunction,
  ) {
    if (!request.user) {
      next(new HttpError(401, "Authentication is required."));
      return;
    }

    if (!allowedRoles.includes(request.user.role)) {
      next(new HttpError(403, "You do not have access to this resource."));
      return;
    }

    next();
  };
}
