import { NextResponse } from "next/server";
import { getLogoFileId } from "@/lib/areas";
import { getLogoBlob } from "@/lib/drive";

export async function GET() {
  const fileId = await getLogoFileId();
  if (!fileId) return new NextResponse(null, { status: 404 });

  const blob = await getLogoBlob(fileId);
  if (!blob) return new NextResponse(null, { status: 404 });

  return new NextResponse(new Uint8Array(blob.buffer), {
    headers: {
      "Content-Type": blob.contentType,
      "Cache-Control": "public, max-age=300"
    }
  });
}
