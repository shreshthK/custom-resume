import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { LocalFileService } from "./local-file.service";

@Controller("files")
export class FilesController {
  constructor(private readonly localFileService: LocalFileService) {}

  @Post("presign-upload")
  presignUpload(@Body() body: { fileName?: string; mimeType?: string }) {
    if (body.mimeType !== "application/pdf") {
      throw new BadRequestException("Only PDF files are supported.");
    }

    const ticket = this.localFileService.createUploadTicket(body.fileName ?? "resume.pdf");

    return {
      uploadUrl: `http://localhost:3000/v1/files/upload/${ticket.token}`,
      fileKey: ticket.fileKey,
      expiresAt: ticket.expiresAt
    };
  }

  @Post("upload/:token")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(@Param("token") token: string, @UploadedFile() file?: any) {
    const ticket = this.localFileService.consumeUploadTicket(token);
    if (!ticket) {
      throw new BadRequestException("Upload token is invalid or expired.");
    }

    if (!file) {
      throw new BadRequestException("No file was uploaded.");
    }

    if (file.mimetype !== "application/pdf") {
      throw new BadRequestException("Only PDF files are supported.");
    }

    this.localFileService.saveFile(ticket.fileKey, file.buffer);

    return {
      fileKey: ticket.fileKey,
      uploaded: true
    };
  }

  @Get("download-url")
  getDownloadUrl(@Query("fileKey") fileKey: string) {
    if (!fileKey) {
      throw new BadRequestException("fileKey is required.");
    }

    if (!this.localFileService.fileExists(fileKey)) {
      throw new NotFoundException("File not found.");
    }

    const ticket = this.localFileService.createDownloadTicket(fileKey);

    return {
      downloadUrl: `http://localhost:3000/v1/files/download/${ticket.token}`,
      expiresAt: ticket.expiresAt
    };
  }

  @Get("download/:token")
  download(@Param("token") token: string, @Res() res: any) {
    const fileKey = this.localFileService.consumeDownloadTicket(token);
    if (!fileKey) {
      throw new NotFoundException("Download link is invalid or expired.");
    }

    const absolutePath = this.localFileService.getAbsolutePath(fileKey);
    return res.download(absolutePath);
  }
}
