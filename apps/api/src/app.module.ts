import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FilesController } from "./files.controller";
import { ResumesController } from "./resumes.controller";
import { ResumesService } from "./resumes.service";

@Module({
  imports: [],
  controllers: [AppController, FilesController, ResumesController],
  providers: [AppService, ResumesService]
})
export class AppModule {}
