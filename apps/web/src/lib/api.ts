import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export function createAuthHeaders(token?: string) {
  if (!token) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong.",
) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
