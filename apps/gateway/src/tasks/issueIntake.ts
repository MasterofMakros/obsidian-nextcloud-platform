import type { IssueIntakeOutputType } from "../schemas.js";

/**
 * Issue Intake Agent - Classifies support emails into structured metadata.
 * 
 * TODO: Wire up LLM (OpenAI, Claude, Gemini, local) to process input.
 * For now, returns fail-closed defaults.
 */
export async function runIssueIntake(input: Record<string, unknown>): Promise<IssueIntakeOutputType> {
    // Extract available info from input
    const subject = String(input.subject || "");
    const text = String(input.text || "");

    // Basic heuristics (placeholder until LLM is connected)
    let type: IssueIntakeOutputType["type"] = "question";
    let severity: IssueIntakeOutputType["severity"] = "minor";
    let area: IssueIntakeOutputType["area"] = "unknown";

    const lowerText = (subject + " " + text).toLowerCase();

    // Type detection
    if (lowerText.includes("bug") || lowerText.includes("crash") || lowerText.includes("error")) {
        type = "bug";
    } else if (lowerText.includes("billing") || lowerText.includes("payment") || lowerText.includes("license")) {
        type = "billing";
    } else if (lowerText.includes("feature") || lowerText.includes("suggest") || lowerText.includes("request")) {
        type = "feature";
    }

    // Severity detection
    if (lowerText.includes("urgent") || lowerText.includes("critical") || lowerText.includes("blocking")) {
        severity = "critical";
    } else if (lowerText.includes("important") || lowerText.includes("broken")) {
        severity = "major";
    }

    // Area detection
    if (lowerText.includes("plugin") || lowerText.includes("obsidian")) {
        area = "plugin";
    } else if (lowerText.includes("api") || lowerText.includes("backend")) {
        area = "api";
    } else if (lowerText.includes("website") || lowerText.includes("checkout")) {
        area = "website";
    } else if (lowerText.includes("license") || lowerText.includes("activation")) {
        area = "licensing";
    }

    return {
        type,
        severity,
        area,
        summary: subject.slice(0, 160) || "Unclassified support request",
        repro_steps: "Please provide:\n- Obsidian version\n- Plugin version\n- OS\n- Steps to reproduce",
        confidence: 0.3, // Low confidence without LLM
        suggested_labels: [],
    };
}
