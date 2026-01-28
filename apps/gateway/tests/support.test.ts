import { describe, it, expect, vi, beforeEach } from "vitest";
import { runSupportChat } from "../src/tasks/supportChat.js";

// Mocks
vi.mock("../src/llm.js", () => ({
    getOpenAIClient: vi.fn(),
    isLLMConfigured: vi.fn(),
}));

vi.mock("../src/lib/knowledge.js", () => ({
    loadKnowledgeBase: vi.fn(),
}));

import { getOpenAIClient, isLLMConfigured } from "../src/llm.js";
import { loadKnowledgeBase } from "../src/lib/knowledge.js";

describe("Support Chat Task", () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should return fallback if LLM is not configured", async () => {
        (isLLMConfigured as any).mockReturnValue(false);
        (loadKnowledgeBase as any).mockResolvedValue("Mock Knowledge");

        const result = await runSupportChat({ query: "Help" });

        expect(result.confidence).toBe(0);
        expect(result.answer).toContain("LLM not configured");
    });

    it("should process query with knowledge base if LLM is configured", async () => {
        (isLLMConfigured as any).mockReturnValue(true);
        (loadKnowledgeBase as any).mockResolvedValue("Mock Knowledge Base Content");

        // Mock OpenAI response
        const mockCreate = vi.fn().mockResolvedValue({
            choices: [{
                message: {
                    content: JSON.stringify({
                        answer: "This is a test answer based on docs.",
                        confidence: 0.9,
                        sources: ["TEST.md"]
                    })
                }
            }]
        });

        (getOpenAIClient as any).mockReturnValue({
            chat: { completions: { create: mockCreate } }
        });

        const result = await runSupportChat({ query: "How do I test?" });

        expect(result.answer).toBe("This is a test answer based on docs.");
        expect(result.confidence).toBe(0.9);
        expect(result.sources).toEqual(["TEST.md"]);

        // Verify Knowledge Base was loaded
        expect(loadKnowledgeBase).toHaveBeenCalled();

        // Verify Prompt contained knowledge
        const calls = mockCreate.mock.calls;
        const messages = calls[0][0].messages;
        expect(messages[0].content).toContain("Mock Knowledge Base Content");
    });

    it("should handle LLM errors gracefully", async () => {
        (isLLMConfigured as any).mockReturnValue(true);
        (loadKnowledgeBase as any).mockResolvedValue("Mock Docs");

        // Mock Error
        const mockCreate = vi.fn().mockRejectedValue(new Error("OpenAI Down"));
        (getOpenAIClient as any).mockReturnValue({
            chat: { completions: { create: mockCreate } }
        });

        const result = await runSupportChat({ query: "Crash me" });

        // Should return a fallback structure, basically null in task logic returns empty/failed?
        // Wait, issueIntake returns null, but supportChat logic handles null from generateAnswerWithLLM?
        // Let's check supportChat.ts implementation again.
        // It returns { answer: "I'm sorry...", confidence: 0 } if generateAnswerWithLLM returns null.

        expect(result.confidence).toBe(0);
        expect(result.answer).toBe("I'm sorry, I cannot answer questions right now (LLM not configured)."); // Actually falls back to same msg if result is null
    });
});
