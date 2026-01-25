import type { FixProposalOutputType } from "../schemas.js";
import { getOpenAIClient, isLLMConfigured } from "../llm.js";

/**
 * Fix Proposal Agent - Analyzes issues and proposes patches.
 * Uses OpenAI for intelligent analysis, falls back to stub if unconfigured.
 * 
 * SAFETY: This agent should NEVER auto-merge. Human review is required.
 */
export async function runFixProposal(input: Record<string, unknown>): Promise<FixProposalOutputType> {
    const title = String(input.title || "");
    const body = String(input.body || "");
    const labels = Array.isArray(input.labels) ? input.labels : [];
    const number = input.number ? Number(input.number) : 0;

    // Try LLM analysis first
    if (isLLMConfigured()) {
        const llmResult = await analyzeWithLLM(title, body, labels, number);
        if (llmResult) return llmResult;
    }

    // Fallback to stub response
    return generateStubResponse(title, labels);
}

/**
 * LLM-powered issue analysis and fix proposal
 */
async function analyzeWithLLM(
    title: string,
    body: string,
    labels: unknown[],
    issueNumber: number
): Promise<FixProposalOutputType | null> {
    const client = getOpenAIClient();
    if (!client) return null;

    const labelsStr = labels.map(l => String(l)).join(", ");

    const systemPrompt = `You are a senior developer analyzing a GitHub issue for "Obsidian Nextcloud Media", a plugin that syncs media between Obsidian and Nextcloud.

Analyze the issue and return a JSON object with these exact fields:
- analysis_md: string (detailed markdown analysis, max 10000 chars)
- risk: "low" | "medium" | "high" (risk level of implementing a fix)
- confidence: number 0-1 (how confident you are in this analysis)
- patch_unified_diff: string | null (unified diff if you can propose a fix, null if analysis only)
- pr_title: string (suggested PR title, max 120 chars)
- pr_body: string (suggested PR body with summary, changes, testing notes)

Analysis guidelines:
- Focus on understanding the root cause
- Consider edge cases and potential regressions
- Identify files likely to need changes
- If bug: explain what's wrong and how to fix
- If feature: outline implementation approach
- Be conservative with risk assessment

Risk levels:
- low: cosmetic changes, documentation, adding tests
- medium: bug fixes, minor feature additions
- high: core logic changes, breaking changes, security fixes

IMPORTANT: Only generate a patch if you are VERY confident. Otherwise, set patch_unified_diff to null.
All changes require human review before merging.

Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Issue #${issueNumber}: ${title}

Labels: ${labelsStr || "None"}

Issue Body:
${body.slice(0, 8000)}`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 3000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content) as FixProposalOutputType;

        // Validate and sanitize
        return {
            analysis_md: String(parsed.analysis_md || "No analysis generated.").slice(0, 20000),
            risk: validateRisk(parsed.risk),
            confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.3)),
            patch_unified_diff: parsed.patch_unified_diff
                ? String(parsed.patch_unified_diff).slice(0, 200000)
                : null,
            pr_title: String(parsed.pr_title || `fix: Address issue #${issueNumber}`).slice(0, 120),
            pr_body: String(parsed.pr_body || "").slice(0, 20000),
        };
    } catch (error) {
        console.error("[fixProposal] LLM error, falling back to stub:", error);
        return null;
    }
}

/**
 * Stub response for when LLM is not available
 */
function generateStubResponse(title: string, labels: unknown[]): FixProposalOutputType {
    const labelsStr = labels.map(l => String(l)).join(", ");

    return {
        analysis_md: `## Issue Analysis

### Context
- **Title:** ${title.slice(0, 100)}
- **Labels:** ${labelsStr || "None"}

### Assessment
This issue requires LLM integration to generate a detailed analysis.

### Why No Patch?
The gateway is running in stub mode. To enable AI-powered patch generation:
1. Set OPENAI_API_KEY environment variable
2. Restart the gateway service

### Manual Action Required
Please review the issue manually and implement a fix if appropriate.

---
*Human-in-the-loop: AI cannot auto-merge. All changes require maintainer approval.*`,
        risk: "high",
        confidence: 0.1,
        patch_unified_diff: null,
        pr_title: `fix: Address issue - ${title.slice(0, 80)}`,
        pr_body: `## Summary
Addresses: ${title}

## Changes
- (Pending LLM implementation)

## Testing
- (Pending)

---
*Generated by AI Gateway stub. Connect LLM for actual fix proposals.*`,
    };
}

/**
 * Type-safe risk validation
 */
function validateRisk(value: unknown): "low" | "medium" | "high" {
    if (value === "low" || value === "medium" || value === "high") {
        return value;
    }
    return "high"; // Default to high risk
}
