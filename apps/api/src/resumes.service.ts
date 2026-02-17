import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ResumeDraft } from "@custom-resume/types";
import { JobRecord, JobStore } from "./job.store";
import { LocalFileService } from "./local-file.service";

@Injectable()
export class ResumesService {
  private readonly store = new JobStore();
  constructor(private readonly localFileService: LocalFileService) {}

  createJob(fileKey: string): JobRecord {
    if (!this.localFileService.fileExists(fileKey)) {
      throw new Error("Uploaded resume file not found.");
    }

    const now = new Date();
    const jobId = randomUUID();

    const record: JobRecord = {
      jobId,
      userId: "dev-user",
      status: "QUEUED",
      resumeFileKey: fileKey,
      primaryModel: "deepseek-r1",
      fallbackTriggered: false,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    };

    this.store.create(record);

    const outputFileKey = `outputs/${jobId}.pdf`;
    this.localFileService.copyFile(fileKey, outputFileKey);

    // Placeholder behavior to keep frontend integration unblocked until SQS worker is wired.
    this.store.update(jobId, {
      status: "COMPLETED",
      finalModelUsed: "deepseek-r1",
      outputFileKey,
      draftResume: this.mockDraft()
    });

    return this.store.get(jobId)!;
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.store.get(jobId);
  }

  regeneratePdf(jobId: string, editedDraftResume: ResumeDraft): JobRecord | undefined {
    const existing = this.store.get(jobId);
    if (!existing) {
      return undefined;
    }

    const outputFileKey = `outputs/${jobId}-edited.pdf`;
    this.localFileService.copyFile(existing.resumeFileKey, outputFileKey);

    return this.store.update(jobId, {
      status: "COMPLETED",
      outputFileKey,
      draftResume: editedDraftResume,
      finalModelUsed: "deepseek-r1"
    });
  }

  private mockDraft(): ResumeDraft {
    return {
      header: {
        fullName: "Candidate Name",
        email: "candidate@example.com"
      },
      summary:
        "Results-driven software engineer with experience shipping production systems and improving reliability.",
      skills: ["TypeScript", "React", "Node.js", "AWS"],
      experience: [
        {
          company: "Example Inc",
          title: "Software Engineer",
          startDate: "2022-01",
          endDate: "Present",
          bullets: [
            "Built internal tools that reduced manual workflows by 30%.",
            "Implemented APIs and background workers for document processing."
          ]
        }
      ],
      projects: [
        {
          name: "Resume Tailor",
          bullets: ["Developed a Bedrock-driven resume tailoring workflow."]
        }
      ],
      education: [
        {
          school: "State University",
          degree: "B.S. in Computer Science",
          graduationDate: "2021-05"
        }
      ],
      certifications: []
    };
  }
}
