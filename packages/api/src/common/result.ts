import { z } from "zod";

import { ApiErrorSchema } from "./apiError";
import type { ApiError } from "./apiError";

/**
 * Type Result<T, K> = | { status: "ok"; data: T; error?: never; timestamp: number; } | { status:
 * "error"; data?: never; error: K; timestamp: number; };
 */
type ResultSchemaOf<T extends z.ZodType, E extends z.ZodType> = z.ZodDiscriminatedUnion<
  [
    z.ZodObject<{ status: z.ZodLiteral<"ok">; data: T; timestamp: z.ZodNumber }>,
    z.ZodObject<{ status: z.ZodLiteral<"error">; error: E; timestamp: z.ZodNumber }>,
  ]
>;

export function ResultSchema<T extends z.ZodType>(
  dataSchema: T,
): ResultSchemaOf<T, typeof ApiErrorSchema>;

export function ResultSchema<T extends z.ZodType, E extends z.ZodType>(
  dataSchema: T,
  errorSchema: E,
): ResultSchemaOf<T, E>;

export function ResultSchema(
  dataSchema: z.ZodType,
  errorSchema: z.ZodType = ApiErrorSchema,
): z.ZodType {
  return z.discriminatedUnion("status", [
    z.object({
      status: z.literal("ok"),
      data: dataSchema,
      timestamp: z.number(),
    }),
    z.object({
      status: z.literal("error"),
      error: errorSchema,
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
