import type { AnalysisOutputType } from "../schemas.js";

/**
 * Analysis Agent - Provides root-cause analysis without code changes.
 * 
 * TODO: Wire up LLM to analyze issue context and provide hypothesis.
 * For now, returns placeholder requiring manual implementation.
 */
export async function runAnalysis(input: Record<string, unknown>): Promise<AnalysisOutputType> {
    const title = String(input.title || "");
    const body = String(input.body || "");

    return {
        analysis_md: `## Summary
This issue requires manual analysis.

## Issue Context
- **Title:** ${title.slice(0, 100)}
- **Has body:** ${body.length > 0 ? "Yes" : "No"}

## Next Steps
1. Connect LLM to this gateway endpoint
2. Provide repository context for better analysis
3. Review issue labels for routing hints

## Note
This is a placeholder response. Wire up your preferred LLM (OpenAI, Claude, Gemini) to enable AI-powered analysis.`,
        risk: "low",
        confidence: 0.1, // Very low without LLM
    };
}
