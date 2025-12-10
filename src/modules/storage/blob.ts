import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

export type BlobReference = {
  id: string;
  path: string;
  mimeType: string;
  size: number;
};

/**
 * Placeholder de storage. Substitua por S3/MinIO/GCS.
 */
export async function storeBufferLocally(
  buffer: Buffer,
  filename: string,
  mimeType = "application/octet-stream"
): Promise<BlobReference> {
  const id = randomUUID();
  const dir = path.join(process.cwd(), ".tmp_uploads");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${id}-${filename}`);
  await writeFile(filePath, buffer);

  return {
    id,
    path: filePath,
    mimeType,
    size: buffer.byteLength
  };
}
