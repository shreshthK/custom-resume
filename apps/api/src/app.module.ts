import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FilesController } from "./files.controller";
import { LocalFileService } from "./local-file.service";
import { ResumesController } from "./resumes.controller";
import { ResumesService } from "./resumes.service";

@Module({
  imports: [],
  controllers: [AppController, FilesController, ResumesController],
  providers: [AppService, ResumesService, LocalFileService]
})
export class AppModule {}
