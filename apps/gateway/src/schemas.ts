import { z } from "zod";

// Request schema
export const AgentRunRequest = z.object({
    task: z.enum(["issue_intake", "analysis", "fix_proposal", "support_chat"]),
    input: z.record(z.string(), z.any()),
    context: z.record(z.string(), z.any()).optional(),
});

// Output schemas (strict)
export const IssueIntakeOutput = z.object({
    type: z.enum(["bug", "question", "billing", "feature"]),
    severity: z.enum(["critical", "major", "minor"]),
    area: z.enum(["plugin", "api", "website", "licensing", "unknown"]),
    summary: z.string().min(3).max(160),
    repro_steps: z.string().min(0).max(8000),
    confidence: z.number().min(0).max(1),
    suggested_labels: z.array(z.string().max(40)).max(5).default([]),
});

export const AnalysisOutput = z.object({
    analysis_md: z.string().min(0).max(20000),
    risk: z.enum(["low", "medium", "high"]),
    confidence: z.number().min(0).max(1),
});

export const FixProposalOutput = z.object({
    analysis_md: z.string().min(0).max(20000),
    risk: z.enum(["low", "medium", "high"]),
    confidence: z.number().min(0).max(1),
    patch_unified_diff: z.string().max(200000).nullable(),
    pr_title: z.string().min(3).max(120),
    pr_body: z.string().min(0).max(20000),
});

export const SupportChatOutput = z.object({
    answer: z.string().min(1).max(20000),
    confidence: z.number().min(0).max(1),
    sources: z.array(z.string()).default([]),
});

// Type exports
export type AgentRunRequestType = z.infer<typeof AgentRunRequest>;
export type IssueIntakeOutputType = z.infer<typeof IssueIntakeOutput>;
export type AnalysisOutputType = z.infer<typeof AnalysisOutput>;
export type FixProposalOutputType = z.infer<typeof FixProposalOutput>;
export type SupportChatOutputType = z.infer<typeof SupportChatOutput>;
