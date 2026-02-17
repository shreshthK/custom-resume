import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
const API_BASE = "http://localhost:3000/v1";
const INITIAL_DRAFT = {
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
    const [customInstructions, setCustomInstructions] = useState("Optimize for ATS and prioritize measurable achievements.");
    const [job, setJob] = useState(null);
    const [draft, setDraft] = useState(INITIAL_DRAFT);
    const [statusMessage, setStatusMessage] = useState("Ready.");
    const canGenerate = useMemo(() => Boolean(fileKey && linkedinUrl && jobDescriptionText && customInstructions), [customInstructions, fileKey, jobDescriptionText, linkedinUrl]);
    async function handleGenerate(event) {
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
        const data = (await res.json());
        await fetchJob(data.jobId);
    }
    async function fetchJob(jobId) {
        const res = await fetch(`${API_BASE}/resumes/jobs/${jobId}`);
        if (!res.ok) {
            setStatusMessage("Could not load job.");
            return;
        }
        const data = (await res.json());
        setJob(data);
        setStatusMessage(`Job ${data.status}`);
        if (data.draftResume) {
            setDraft(data.draftResume);
        }
    }
    async function regeneratePdf() {
        if (!job)
            return;
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
        if (!job?.pdfFileKey)
            return;
        const res = await fetch(`${API_BASE}/files/download-url?fileKey=${encodeURIComponent(job.pdfFileKey)}`);
        if (!res.ok) {
            setStatusMessage("Could not get download URL.");
            return;
        }
        const data = (await res.json());
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
    }
    return (_jsx("main", { className: "app-shell", children: _jsxs("section", { className: "card", children: [_jsx("p", { className: "eyebrow", children: "Custom Resume" }), _jsx("h1", { children: "AI Resume Tailor" }), _jsx("p", { className: "muted", children: statusMessage }), _jsxs("form", { className: "form-grid", onSubmit: handleGenerate, children: [_jsxs("label", { children: ["Resume File Key", _jsx("input", { value: fileKey, onChange: (e) => setFileKey(e.target.value) })] }), _jsxs("label", { children: ["LinkedIn Job URL", _jsx("input", { value: linkedinUrl, onChange: (e) => setLinkedinUrl(e.target.value) })] }), _jsxs("label", { children: ["Job Description", _jsx("textarea", { value: jobDescriptionText, onChange: (e) => setJobDescriptionText(e.target.value), rows: 6 })] }), _jsxs("label", { children: ["Custom Instructions", _jsx("textarea", { value: customInstructions, onChange: (e) => setCustomInstructions(e.target.value), rows: 3 })] }), _jsx("button", { type: "submit", disabled: !canGenerate, children: "Generate Draft" })] }), job ? (_jsxs("section", { className: "result", children: [_jsxs("h2", { children: ["Job: ", job.jobId] }), _jsxs("p", { children: ["Model: ", job.modelInfo?.finalModelUsed ?? job.modelInfo?.primaryModel ?? "unknown", " ", job.modelInfo?.fallbackTriggered ? "(fallback used)" : ""] }), _jsxs("label", { children: ["Draft (JSON)", _jsx("textarea", { rows: 14, value: JSON.stringify(draft, null, 2), onChange: (e) => {
                                        try {
                                            const parsed = JSON.parse(e.target.value);
                                            setDraft(parsed);
                                        }
                                        catch {
                                            // Keep current draft if JSON is invalid while typing.
                                        }
                                    } })] }), _jsxs("div", { className: "actions", children: [_jsx("button", { type: "button", onClick: regeneratePdf, children: "Regenerate PDF" }), _jsx("button", { type: "button", onClick: getDownloadUrl, disabled: !job.pdfFileKey, children: "Get Download Link" }), _jsx("button", { type: "button", onClick: () => fetchJob(job.jobId), children: "Refresh Job" })] })] })) : null] }) }));
}
