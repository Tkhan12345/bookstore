import "server-only";
import { NextResponse } from "next/server";
import { readJsonWithLimit, RequestBodyError } from "./read-json";

export async function parseJsonRequest(
  request: Request,
  maxBytes = 64 * 1024,
): Promise<
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse }
> {
  try {
    return { ok: true, body: await readJsonWithLimit(request, maxBytes) };
  } catch (error) {
    if (error instanceof RequestBodyError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: error.message },
          { status: error.status },
        ),
      };
    }
    throw error;
  }
}
