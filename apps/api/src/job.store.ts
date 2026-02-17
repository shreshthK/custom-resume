import { GenerationJob, ResumeDraft } from "@custom-resume/types";

export interface JobRecord extends GenerationJob {
  draftResume?: ResumeDraft;
}

export class JobStore {
  private readonly jobs = new Map<string, JobRecord>();

  create(record: JobRecord): JobRecord {
    this.jobs.set(record.jobId, record);
    return record;
  }

  get(jobId: string): JobRecord | undefined {
    return this.jobs.get(jobId);
  }

  update(jobId: string, updates: Partial<JobRecord>): JobRecord | undefined {
    const current = this.jobs.get(jobId);
    if (!current) {
      return undefined;
    }

    const next = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.jobs.set(jobId, next);
    return next;
  }
}
