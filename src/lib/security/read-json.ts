import "server-only";

export class RequestBodyError extends Error {
  constructor(
    public readonly status: 400 | 413,
    message: string,
  ) {
    super(message);
    this.name = "RequestBodyError";
  }
}

export async function readJsonWithLimit(
  request: Request,
  maxBytes = 16 * 1024,
): Promise<unknown> {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1) {
    throw new Error("Invalid request body limit");
  }

  const declaredLength = request.headers.get("content-length");

  if (declaredLength !== null) {
    const length = Number(declaredLength);

    if (
      !Number.isSafeInteger(length) ||
      length < 0
    ) {
      throw new RequestBodyError(400, "Invalid Content-Length");
    }

    if (length > maxBytes) {
      throw new RequestBodyError(413, "Request body too large");
    }
  }

  if (!request.body) {
    throw new RequestBodyError(400, "Missing JSON body");
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      totalBytes += value.byteLength;

      if (totalBytes > maxBytes) {
        throw new RequestBodyError(413, "Request body too large");
      }

      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof RequestBodyError) throw error;
    throw new RequestBodyError(400, "Unable to read request body");
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return JSON.parse(text) as unknown;
  } catch {
    throw new RequestBodyError(400, "Invalid JSON body");
  }
}
