import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { AuthTokenPayload, AuthenticatedUser } from "../types/auth";

export function signAuthToken(user: AuthenticatedUser) {
  return jwt.sign(
    {
      role: user.role,
      doctorProfileId: user.doctorProfileId,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      subject: user.id,
    },
  );
}

export function verifyAuthToken(token: string) {
  const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;

  return {
    sub: payload.sub ?? "",
    role: payload.role as AuthTokenPayload["role"],
    doctorProfileId: payload.doctorProfileId as string | undefined,
  } satisfies AuthTokenPayload;
}
