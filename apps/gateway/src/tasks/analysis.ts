import type { AnalysisOutputType } from "../schemas.js";
import { getOpenAIClient, isLLMConfigured } from "../llm.js";

/**
 * Analysis Agent - Provides root-cause analysis without code changes.
 * Uses OpenAI for intelligent root-cause analysis, falls back to template if unconfigured.
 */
export async function runAnalysis(input: Record<string, unknown>): Promise<AnalysisOutputType> {
    const title = String(input.title || "");
    const body = String(input.body || "");
    const labels = Array.isArray(input.labels) ? input.labels : [];

    // Try LLM analysis first
    if (isLLMConfigured()) {
        const llmResult = await analyzeWithLLM(title, body, labels);
        if (llmResult) return llmResult;
    }

    // Fallback to structured template
    return generateTemplateAnalysis(title, body, labels);
}

/**
 * LLM-powered root-cause analysis
 */
async function analyzeWithLLM(
    title: string,
    body: string,
    labels: unknown[]
): Promise<AnalysisOutputType | null> {
    const client = getOpenAIClient();
    if (!client) return null;

    const labelsStr = labels.map(l => String(l)).join(", ");

    const systemPrompt = `You are a senior developer performing root-cause analysis for "Obsidian Nextcloud Media", a plugin that syncs media between Obsidian and Nextcloud.

Analyze the GitHub issue and provide a structured root-cause analysis. Return a JSON object with these exact fields:
- analysis_md: string (detailed markdown analysis with sections: Summary, Root Cause, Impact, Files Likely Affected, Recommended Investigation)
- risk: "low" | "medium" | "high" (risk level of the underlying issue)
- confidence: number 0-1 (how confident you are in this analysis based on available information)

Analysis guidelines:
- Be thorough but concise
- Identify the most likely root cause based on symptoms
- Consider code structure: plugin (Obsidian), api (Fastify backend), website (Next.js), licensing (Ed25519)
- Flag security concerns immediately
- Suggest specific files or areas to investigate
- If insufficient info, say so clearly

Risk levels:
- low: isolated issue, clear workaround, minimal impact
- medium: affects functionality, moderate user impact
- high: data loss, security vulnerability, widespread failure

Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Issue Title: ${title}
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
            max_tokens: 2000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content) as AnalysisOutputType;

        // Validate and sanitize
        return {
            analysis_md: String(parsed.analysis_md || generateFallbackAnalysis(title, body)).slice(0, 20000),
            risk: validateRisk(parsed.risk),
            confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
        };
    } catch (error) {
        console.error("[analysis] LLM error, falling back to template:", error);
        return null;
    }
}

/**
 * Template-based analysis when LLM is unavailable
 */
function generateTemplateAnalysis(
    title: string,
    body: string,
    labels: unknown[]
): AnalysisOutputType {
    const labelsStr = labels.map(l => String(l)).join(", ");
    const lowerText = (title + " " + body).toLowerCase();

    // Detect issue area
    let area = "unknown";
    if (lowerText.includes("plugin") || lowerText.includes("obsidian")) area = "plugin";
    else if (lowerText.includes("api") || lowerText.includes("backend") || lowerText.includes("server")) area = "api";
    else if (lowerText.includes("website") || lowerText.includes("checkout") || lowerText.includes("web")) area = "website";
    else if (lowerText.includes("license") || lowerText.includes("activation")) area = "licensing";

    // Detect severity indicators
    let risk: "low" | "medium" | "high" = "low";
    if (lowerText.includes("crash") || lowerText.includes("data loss") || lowerText.includes("security")) {
        risk = "high";
    } else if (lowerText.includes("error") || lowerText.includes("broken") || lowerText.includes("not working")) {
        risk = "medium";
    }

    return {
        analysis_md: `## Summary
Issue affects the **${area}** component based on keywords in title and description.

## Root Cause
Insufficient information available for automated root-cause analysis.

## Issue Context
- **Title:** ${title.slice(0, 100)}
- **Labels:** ${labelsStr || "None"}
- **Detected Area:** ${area}
- **Has detailed description:** ${body.length > 100 ? "Yes" : "Limited"}

## Recommended Investigation
1. Review recent changes in \`${area}\` related code
2. Check error logs for stack traces
3. Attempt to reproduce with minimal steps
4. Verify environment (Obsidian version, OS, plugin version)

## Files Likely Affected
${getLikelyFiles(area)}

---
*Template analysis - connect OpenAI for AI-powered root-cause detection*`,
        risk,
        confidence: 0.3,
    };
}

/**
 * Get likely files based on area
 */
function getLikelyFiles(area: string): string {
    const files: Record<string, string> = {
        plugin: "- apps/plugin/main.ts\n- apps/plugin/license.ts\n- apps/plugin/sync.ts",
        api: "- apps/api/src/routes/*.ts\n- apps/api/src/lib/licensing.ts\n- apps/api/src/plugins/*.ts",
        website: "- apps/web/app/**/*.tsx\n- apps/web/components/*.tsx",
        licensing: "- apps/api/src/lib/licensing.ts\n- apps/plugin/license.ts\n- packages/db/prisma/schema.prisma",
        unknown: "- (Requires manual investigation)",
    };
    return files[area] || files.unknown;
}

/**
 * Generate fallback analysis when parsing fails
 */
function generateFallbackAnalysis(title: string, body: string): string {
    return `## Analysis
Unable to generate detailed analysis.

**Issue:** ${title.slice(0, 100)}
**Description length:** ${body.length} characters

Please review manually.`;
}

/**
 * Type-safe risk validation
 */
function validateRisk(value: unknown): "low" | "medium" | "high" {
    if (value === "low" || value === "medium" || value === "high") {
        return value;
    }
    return "medium"; // Default to medium when unknown
}
