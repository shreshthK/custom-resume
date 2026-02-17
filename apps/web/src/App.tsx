import { FormEvent, useMemo, useState } from "react";
import { ResumeDraft } from "@custom-resume/types";

const API_BASE = "http://localhost:3000/v1";

interface JobResponse {
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  draftResume?: ResumeDraft;
  pdfFileKey?: string;
  modelInfo?: {
    primaryModel: string;
    finalModelUsed?: string;
    fallbackTriggered: boolean;
  };
}

const INITIAL_DRAFT: ResumeDraft = {
  header: {
    fullName: "",
    email: ""
  },
  summary: "",
  skills: [],
  experience: [],
  projects: [],
  education: [],
  certifications: []
};

export default function App() {
  const [fileKey, setFileKey] = useState("uploads/sample-resume.pdf");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [jobDescriptionText, setJobDescriptionText] = useState("");
  const [customInstructions, setCustomInstructions] = useState(
    "Optimize for ATS and prioritize measurable achievements."
  );
  const [job, setJob] = useState<JobResponse | null>(null);
  const [draft, setDraft] = useState<ResumeDraft>(INITIAL_DRAFT);
  const [statusMessage, setStatusMessage] = useState("Ready.");

  const canGenerate = useMemo(
    () => Boolean(fileKey && linkedinUrl && jobDescriptionText && customInstructions),
    [customInstructions, fileKey, jobDescriptionText, linkedinUrl]
  );

  async function handleGenerate(event: FormEvent) {
    event.preventDefault();
    setStatusMessage("Generating resume...");

    const res = await fetch(`${API_BASE}/resumes/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileKey,
        linkedinUrl,
        jobDescriptionText,
        customInstructions
      })
    });

    if (!res.ok) {
      setStatusMessage("Generation request failed.");
      return;
    }

    const data = (await res.json()) as { jobId: string };
    await fetchJob(data.jobId);
  }

  async function fetchJob(jobId: string) {
    const res = await fetch(`${API_BASE}/resumes/jobs/${jobId}`);
    if (!res.ok) {
      setStatusMessage("Could not load job.");
      return;
    }

    const data = (await res.json()) as JobResponse;
    setJob(data);
    setStatusMessage(`Job ${data.status}`);
    if (data.draftResume) {
      setDraft(data.draftResume);
    }
  }

  async function regeneratePdf() {
    if (!job) return;
    setStatusMessage("Regenerating PDF...");
    const res = await fetch(`${API_BASE}/resumes/jobs/${job.jobId}/regenerate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ editedDraftResume: draft })
    });
    if (!res.ok) {
      setStatusMessage("Regenerate failed.");
      return;
    }
    await fetchJob(job.jobId);
  }

  async function getDownloadUrl() {
    if (!job?.pdfFileKey) return;
    const res = await fetch(`${API_BASE}/files/download-url?fileKey=${encodeURIComponent(job.pdfFileKey)}`);
    if (!res.ok) {
      setStatusMessage("Could not get download URL.");
      return;
    }
    const data = (await res.json()) as { downloadUrl: string };
    window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <main className="app-shell">
      <section className="card">
        <p className="eyebrow">Custom Resume</p>
        <h1>AI Resume Tailor</h1>
        <p className="muted">{statusMessage}</p>

        <form className="form-grid" onSubmit={handleGenerate}>
          <label>
            Resume File Key
            <input value={fileKey} onChange={(e) => setFileKey(e.target.value)} />
          </label>
          <label>
            LinkedIn Job URL
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </label>
          <label>
            Job Description
            <textarea
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              rows={6}
            />
          </label>
          <label>
            Custom Instructions
            <textarea
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={3}
            />
          </label>
          <button type="submit" disabled={!canGenerate}>
            Generate Draft
          </button>
        </form>

        {job ? (
          <section className="result">
            <h2>Job: {job.jobId}</h2>
            <p>
              Model: {job.modelInfo?.finalModelUsed ?? job.modelInfo?.primaryModel ?? "unknown"}{" "}
              {job.modelInfo?.fallbackTriggered ? "(fallback used)" : ""}
            </p>
            <label>
              Draft (JSON)
              <textarea
                rows={14}
                value={JSON.stringify(draft, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value) as ResumeDraft;
                    setDraft(parsed);
                  } catch {
                    // Keep current draft if JSON is invalid while typing.
                  }
                }}
              />
            </label>
            <div className="actions">
              <button type="button" onClick={regeneratePdf}>
                Regenerate PDF
              </button>
              <button type="button" onClick={getDownloadUrl} disabled={!job.pdfFileKey}>
                Get Download Link
              </button>
              <button type="button" onClick={() => fetchJob(job.jobId)}>
                Refresh Job
              </button>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
