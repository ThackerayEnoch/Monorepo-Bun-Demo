import { z } from "zod";

import { ApiErrorSchema } from "./apiError";
import type { ApiError } from "./apiError";

/**
 * Type Result<T, K> = | { status: "ok"; data: T; error?: never; timestamp: number; } | { status:
 * "error"; data?: never; error: K; timestamp: number; };
 */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters
export function ResultSchema<T extends z.ZodType, E extends z.ZodType = typeof ApiErrorSchema>(
  dataSchema: T,
  errorSchema?: E,
): z.ZodType {
  const error = errorSchema ?? ApiErrorSchema;

  return z.discriminatedUnion("status", [
    z.object({
      status: z.literal("ok"),
      data: dataSchema,
      timestamp: z.number(),
    }),
    z.object({
      status: z.literal("error"),
      error,
      timestamp: z.number(),
    }),
  ]);
}

export type Result<T, E = ApiError> =
  | {
      status: "ok";
      data: T;
      timestamp: number;
    }
  | {
      status: "error";
      error: E;
      timestamp: number;
    };
