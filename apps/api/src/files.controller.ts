import { Controller, Get, Post, Query, Body, BadRequestException } from "@nestjs/common";

@Controller("files")
export class FilesController {
  @Post("presign-upload")
  presignUpload(@Body() body: { fileName?: string; mimeType?: string }) {
    if (body.mimeType !== "application/pdf") {
      throw new BadRequestException("Only PDF files are supported.");
    }

    const now = Date.now();
    const fileKey = `uploads/${now}-${body.fileName ?? "resume.pdf"}`;

    return {
      uploadUrl: `https://example-upload-url.local/${fileKey}`,
      fileKey,
      expiresAt: new Date(now + 10 * 60 * 1000).toISOString()
    };
  }

  @Get("download-url")
  getDownloadUrl(@Query("fileKey") fileKey: string) {
    if (!fileKey) {
      throw new BadRequestException("fileKey is required.");
    }

    const now = Date.now();
    return {
      downloadUrl: `https://example-download-url.local/${encodeURIComponent(fileKey)}`,
      expiresAt: new Date(now + 10 * 60 * 1000).toISOString()
    };
  }
}
