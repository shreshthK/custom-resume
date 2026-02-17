import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";

interface UploadTicket {
  fileKey: string;
  expiresAt: number;
}

interface DownloadTicket {
  fileKey: string;
  expiresAt: number;
}

@Injectable()
export class LocalFileService {
  private readonly uploadTickets = new Map<string, UploadTicket>();
  private readonly downloadTickets = new Map<string, DownloadTicket>();
  private readonly storageRoot = join(process.cwd(), ".local-storage");

  createUploadTicket(fileName: string) {
    const now = Date.now();
    const token = randomUUID();
    const safeName = this.sanitizeFileName(fileName);
    const fileKey = `uploads/${now}-${safeName}`;
    const expiresAt = now + 10 * 60 * 1000;

    this.uploadTickets.set(token, { fileKey, expiresAt });

    return {
      token,
      fileKey,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  consumeUploadTicket(token: string): UploadTicket | null {
    const ticket = this.uploadTickets.get(token);
    if (!ticket) {
      return null;
    }

    if (ticket.expiresAt < Date.now()) {
      this.uploadTickets.delete(token);
      return null;
    }

    this.uploadTickets.delete(token);
    return ticket;
  }

  saveFile(fileKey: string, content: Buffer) {
    const absolutePath = this.absolutePath(fileKey);
    mkdirSync(dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, content);
  }

  copyFile(sourceFileKey: string, targetFileKey: string) {
    const sourcePath = this.absolutePath(sourceFileKey);
    const targetPath = this.absolutePath(targetFileKey);
    mkdirSync(dirname(targetPath), { recursive: true });
    copyFileSync(sourcePath, targetPath);
  }

  fileExists(fileKey: string) {
    return existsSync(this.absolutePath(fileKey));
  }

  createDownloadTicket(fileKey: string) {
    const now = Date.now();
    const token = randomUUID();
    const expiresAt = now + 10 * 60 * 1000;
    this.downloadTickets.set(token, { fileKey, expiresAt });
    return {
      token,
      expiresAt: new Date(expiresAt).toISOString()
    };
  }

  consumeDownloadTicket(token: string): string | null {
    const ticket = this.downloadTickets.get(token);
    if (!ticket) {
      return null;
    }

    if (ticket.expiresAt < Date.now()) {
      this.downloadTickets.delete(token);
      return null;
    }

    this.downloadTickets.delete(token);
    return ticket.fileKey;
  }

  getAbsolutePath(fileKey: string) {
    return this.absolutePath(fileKey);
  }

  private absolutePath(fileKey: string) {
    return join(this.storageRoot, fileKey);
  }

  private sanitizeFileName(fileName: string) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  }
}
