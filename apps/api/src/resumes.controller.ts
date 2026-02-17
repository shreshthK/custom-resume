import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from "@nestjs/common";
import { ResumeDraft } from "@custom-resume/types";
import { ResumesService } from "./resumes.service";

interface GenerateRequest {
  fileKey?: string;
  linkedinUrl?: string;
  jobDescriptionText?: string;
  customInstructions?: string;
}

@Controller("resumes")
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post("generate")
  generate(@Body() body: GenerateRequest) {
    if (!body.fileKey || !body.linkedinUrl || !body.jobDescriptionText || !body.customInstructions) {
      throw new BadRequestException("fileKey, linkedinUrl, jobDescriptionText, and customInstructions are required.");
    }

    const job = this.resumesService.createJob(body.fileKey);
    return {
      jobId: job.jobId,
      status: job.status
    };
  }

  @Get("jobs/:jobId")
  getJob(@Param("jobId") jobId: string) {
    const job = this.resumesService.getJob(jobId);
    if (!job) {
      throw new NotFoundException("Job not found.");
    }

    return {
      jobId: job.jobId,
      status: job.status,
      draftResume: job.draftResume,
      pdfFileKey: job.outputFileKey,
      errorCode: job.errorCode,
      errorMessage: job.errorMessage,
      modelInfo: {
        primaryModel: job.primaryModel,
        finalModelUsed: job.finalModelUsed,
        fallbackTriggered: job.fallbackTriggered
      }
    };
  }

  @Post("jobs/:jobId/regenerate-pdf")
  regeneratePdf(
    @Param("jobId") jobId: string,
    @Body() body: { editedDraftResume?: ResumeDraft }
  ) {
    if (!body.editedDraftResume) {
      throw new BadRequestException("editedDraftResume is required.");
    }

    const job = this.resumesService.regeneratePdf(jobId, body.editedDraftResume);
    if (!job) {
      throw new NotFoundException("Job not found.");
    }

    return {
      jobId: job.jobId,
      status: job.status
    };
  }
}
