import { ZodTypeAny } from "zod";

export function validateWithZod<T>(
  schema: ZodTypeAny<T>,
  data: unknown
): T {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    throw parsed.error; 
  }

  return parsed.data;
}