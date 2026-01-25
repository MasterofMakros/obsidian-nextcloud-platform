import OpenAI from "openai";

/**
 * Shared OpenAI client for Gateway tasks.
 * Falls back gracefully if API key is not configured.
 */
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
    if (client) return client;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }

    client = new OpenAI({ apiKey });
    return client;
}

export function isLLMConfigured(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
}
