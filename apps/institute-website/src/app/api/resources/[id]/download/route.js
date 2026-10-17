
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { resources } from "../../../../../data/resources";

const PRIVATE_FILES_DIRECTORY = path.resolve(
  process.cwd(),
  "private-resources"
);

const ALLOWED_FILE_TYPES = {
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export async function GET(_request, { params }) {
  const { id } = await params;

  // Only catalogue entries may be requested.
  const resource = resources.find((item) => item.id === id);

  if (!resource) {
    return NextResponse.json(
      { error: "Resource not found." },
      { status: 404 }
    );
  }

  // Never serve paid resources through the free-download endpoint.
  if (resource.access !== "free") {
    return NextResponse.json(
      { error: "This resource is not available for free download." },
      { status: 403 }
    );
  }

  // A missing filename means the real file has not been added yet.
  if (!resource.filePath || path.basename(resource.filePath) !== resource.filePath) {
    return NextResponse.json(
      { error: "The resource file is not available yet." },
      { status: 404 }
    );
  }

  const extension = path.extname(resource.filePath).toLowerCase();
  const contentType = ALLOWED_FILE_TYPES[extension];

  if (!contentType) {
    return NextResponse.json(
      { error: "This file type is not supported." },
      { status: 415 }
    );
  }

  const filePath = path.resolve(
    PRIVATE_FILES_DIRECTORY,
    resource.filePath
  );

  // Extra protection against paths escaping the private directory.
  if (!filePath.startsWith(`${PRIVATE_FILES_DIRECTORY}${path.sep}`)) {
    return NextResponse.json(
      { error: "Invalid resource path." },
      { status: 400 }
    );
  }

  let file;

  try {
    file = await readFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "ENOTDIR") {
      return NextResponse.json(
        { error: "The resource file is not available yet." },
        { status: 404 }
      );
    }

    console.error("Resource download failed:", error);

    return NextResponse.json(
      { error: "Unable to download this resource right now." },
      { status: 500 }
    );
  }

  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${resource.filePath}"`,
      "Content-Length": String(file.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
