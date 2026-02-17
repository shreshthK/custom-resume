export type JobStatus = "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ResumeDraft {
  header: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }>;
  projects: Array<{
    name: string;
    bullets: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    graduationDate?: string;
  }>;
  certifications: string[];
}

export interface GenerationJob {
  jobId: string;
  userId: string;
  status: JobStatus;
  resumeFileKey: string;
  outputFileKey?: string;
  primaryModel: "deepseek-r1";
  finalModelUsed?: "deepseek-r1" | "claude-sonnet";
  fallbackTriggered: boolean;
  validationFailures?: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  errorCode?: string;
  errorMessage?: string;
}
