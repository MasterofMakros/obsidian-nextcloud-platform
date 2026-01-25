import type { IssueIntakeOutputType } from "../schemas.js";
import { getOpenAIClient, isLLMConfigured } from "../llm.js";

/**
 * Issue Intake Agent - Classifies support emails into structured metadata.
 * Uses OpenAI for intelligent classification, falls back to heuristics if unconfigured.
 */
export async function runIssueIntake(input: Record<string, unknown>): Promise<IssueIntakeOutputType> {
    const subject = String(input.subject || "");
    const text = String(input.text || "");
    const from = String(input.from || "");

    // Try LLM classification first
    if (isLLMConfigured()) {
        const llmResult = await classifyWithLLM(subject, text, from);
        if (llmResult) return llmResult;
    }

    // Fallback to heuristic classification
    return classifyWithHeuristics(subject, text);
}

/**
 * LLM-powered classification using OpenAI
 */
async function classifyWithLLM(
    subject: string,
    text: string,
    from: string
): Promise<IssueIntakeOutputType | null> {
    const client = getOpenAIClient();
    if (!client) return null;

    const systemPrompt = `You are a support ticket classifier for "Obsidian Nextcloud Media", a plugin that syncs media between Obsidian and Nextcloud.

Analyze the support email and return a JSON object with these exact fields:
- type: "bug" | "question" | "billing" | "feature"
- severity: "critical" | "major" | "minor"
- area: "plugin" | "api" | "website" | "licensing" | "unknown"
- summary: string (max 160 chars, concise problem description)
- repro_steps: string (extracted reproduction steps, or request for more info)
- confidence: number 0-1 (how confident you are in this classification)
- suggested_labels: string[] (max 5 labels, lowercase, no spaces)

Classification guidelines:
- type=bug: crashes, errors, unexpected behavior
- type=question: how-to, general inquiries
- type=billing: payments, subscriptions, licenses
- type=feature: feature requests, suggestions
- severity=critical: data loss, complete failure, security issues
- severity=major: broken functionality, significant impact
- severity=minor: cosmetic, minor inconvenience
- area=plugin: Obsidian plugin issues
- area=api: backend/API issues
- area=website: web interface issues
- area=licensing: license activation, key issues

Return ONLY valid JSON, no markdown.`;

    const userPrompt = `Subject: ${subject}
From: ${from}

Message:
${text.slice(0, 6000)}`;

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 500,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content) as IssueIntakeOutputType;

        // Validate and sanitize
        return {
            type: validateEnum(parsed.type, ["bug", "question", "billing", "feature"], "question"),
            severity: validateEnum(parsed.severity, ["critical", "major", "minor"], "minor"),
            area: validateEnum(parsed.area, ["plugin", "api", "website", "licensing", "unknown"], "unknown"),
            summary: String(parsed.summary || subject).slice(0, 160),
            repro_steps: String(parsed.repro_steps || "Please provide reproduction steps.").slice(0, 8000),
            confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
            suggested_labels: Array.isArray(parsed.suggested_labels)
                ? parsed.suggested_labels.slice(0, 5).map(l => String(l).slice(0, 40))
                : [],
        };
    } catch (error) {
        console.error("[issueIntake] LLM error, falling back to heuristics:", error);
        return null;
    }
}

/**
 * Heuristic fallback classification (original stub logic)
 */
function classifyWithHeuristics(subject: string, text: string): IssueIntakeOutputType {
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
        confidence: 0.3,
        suggested_labels: [],
    };
}

/**
 * Type-safe enum validation helper
 */
function validateEnum<T extends string>(value: unknown, allowed: T[], fallback: T): T {
    if (typeof value === "string" && allowed.includes(value as T)) {
        return value as T;
    }
    return fallback;
}
