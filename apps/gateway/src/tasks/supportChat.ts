import type { SupportChatOutputType } from "../schemas.js";
import { getOpenAIClient, isLLMConfigured } from "../llm.js";
import { loadKnowledgeBase } from "../lib/knowledge.js";

/**
 * Support Chat Agent - Answers user questions based on documentation.
 * Uses Context Injection (RAG) with full docs content.
 */
export async function runSupportChat(input: Record<string, unknown>): Promise<SupportChatOutputType> {
    const query = String(input.query || "");
    const history = input.history as Array<{ role: "user" | "assistant"; content: string }> || [];

    if (!query) {
        return {
            answer: "Please provide a query.",
            confidence: 0,
            sources: [],
        };
    }

    // Load Knowledge Base
    const knowledge = await loadKnowledgeBase();

    // Try LLM
    if (isLLMConfigured()) {
        const result = await generateAnswerWithLLM(query, history, knowledge);
        if (result) return result;
    }

    // Fallback if LLM unavailable
    return {
        answer: "I'm sorry, I cannot answer questions right now (LLM not configured).",
        confidence: 0,
        sources: [],
    };
}

async function generateAnswerWithLLM(
    query: string,
    history: Array<{ role: "user" | "assistant"; content: string }>,
    knowledge: string
): Promise<SupportChatOutputType | null> {
    const client = getOpenAIClient();
    if (!client) return null;

    const systemPrompt = `You are a helpful Support Agent for the "Obsidian Nextcloud Media" plugin.
Your goal is to answer user questions ACCURATELY based ONLY on the provided Knowledge Base.

Knowledge Base:
${knowledge}

Rules:
1. Use ONLY the information in the Knowledge Base.
2. If the answer is not in the Knowledge Base, say "I don't have enough information to answer that." and suggest contacting human support.
3. Be friendly, professional, and concise.
4. If the user asks for code, provide it from the docs.
5. Return a JSON object with:
   - answer: The markdown formatted answer.
   - confidence: 0.0 to 1.0 (1.0 = sure based on docs, 0.5 = partial info, 0.0 = not found).
   - sources: List of filenames (e.g. "DEPLOYMENT.md") that were used.

Format: JSON only.`;

    // Limit history to last 5 msg to save tokens
    const recentHistory = history.slice(-5);

    const messages: any[] = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: query }
    ];

    try {
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            response_format: { type: "json_object" },
            temperature: 0.3, // Low temp for factual answers
        });

        const content = response.choices[0]?.message?.content;
        if (!content) return null;

        const parsed = JSON.parse(content);
        return {
            answer: parsed.answer || "Error generating answer.",
            confidence: parsed.confidence || 0,
            sources: parsed.sources || [],
        };
    } catch (error) {
        console.error("[supportChat] LLM error:", error);
        return null;
    }
}
