import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { ResumeDraft } from "@custom-resume/types";
import { JobRecord, JobStore } from "./job.store";

@Injectable()
export class ResumesService {
  private readonly store = new JobStore();

  createJob(fileKey: string): JobRecord {
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

    // Placeholder behavior to keep frontend integration unblocked until SQS worker is wired.
    this.store.update(jobId, {
      status: "COMPLETED",
      finalModelUsed: "deepseek-r1",
      outputFileKey: `outputs/${jobId}.pdf`,
      draftResume: this.mockDraft()
    });

    return this.store.get(jobId)!;
  }

  getJob(jobId: string): JobRecord | undefined {
    return this.store.get(jobId);
  }

  regeneratePdf(jobId: string, editedDraftResume: ResumeDraft): JobRecord | undefined {
    return this.store.update(jobId, {
      status: "COMPLETED",
      outputFileKey: `outputs/${jobId}-edited.pdf`,
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
