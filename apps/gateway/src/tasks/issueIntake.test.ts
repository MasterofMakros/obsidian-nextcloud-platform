import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runIssueIntake } from './issueIntake.js';

// Mock the llm module
vi.mock('../llm.js', () => ({
    isLLMConfigured: vi.fn(),
    getOpenAIClient: vi.fn(),
}));

import { isLLMConfigured, getOpenAIClient } from '../llm.js';

describe('runIssueIntake', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Heuristic Fallback (no LLM)', () => {
        beforeEach(() => {
            vi.mocked(isLLMConfigured).mockReturnValue(false);
        });

        it('should classify bug based on keywords', async () => {
            const result = await runIssueIntake({
                subject: 'Plugin crashes on startup',
                text: 'Error when opening Obsidian',
            });

            expect(result.type).toBe('bug');
            expect(result.area).toBe('plugin');
            expect(result.confidence).toBe(0.3);
        });

        it('should classify billing based on keywords', async () => {
            const result = await runIssueIntake({
                subject: 'Payment issue',
                text: 'My license is not working',
            });

            expect(result.type).toBe('billing');
            expect(result.area).toBe('licensing');
        });

        it('should classify feature request based on keywords', async () => {
            const result = await runIssueIntake({
                subject: 'Feature suggestion',
                text: 'Please add dark mode',
            });

            expect(result.type).toBe('feature');
        });

        it('should detect critical severity', async () => {
            const result = await runIssueIntake({
                subject: 'Urgent: Data loss',
                text: 'Critical bug causing data loss',
            });

            expect(result.severity).toBe('critical');
        });

        it('should detect major severity', async () => {
            const result = await runIssueIntake({
                subject: 'Important issue',
                text: 'Feature is broken',
            });

            expect(result.severity).toBe('major');
        });

        it('should default to question type and minor severity', async () => {
            const result = await runIssueIntake({
                subject: 'Hello',
                text: 'How do I use this?',
            });

            expect(result.type).toBe('question');
            expect(result.severity).toBe('minor');
            expect(result.area).toBe('unknown');
        });

        it('should handle empty input gracefully', async () => {
            const result = await runIssueIntake({});

            expect(result.type).toBe('question');
            expect(result.summary).toBe('Unclassified support request');
            expect(result.confidence).toBe(0.3);
        });
    });

    describe('LLM Integration', () => {
        const mockClient = {
            chat: {
                completions: {
                    create: vi.fn(),
                },
            },
        };

        beforeEach(() => {
            vi.mocked(isLLMConfigured).mockReturnValue(true);
            vi.mocked(getOpenAIClient).mockReturnValue(mockClient as any);
        });

        it('should use LLM response when available', async () => {
            mockClient.chat.completions.create.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            type: 'bug',
                            severity: 'critical',
                            area: 'plugin',
                            summary: 'Plugin crash on media sync',
                            repro_steps: '1. Open Obsidian\n2. Sync media',
                            confidence: 0.95,
                            suggested_labels: ['bug', 'high-priority'],
                        }),
                    },
                }],
            });

            const result = await runIssueIntake({
                subject: 'Test',
                text: 'Test input',
            });

            expect(result.type).toBe('bug');
            expect(result.severity).toBe('critical');
            expect(result.confidence).toBe(0.95);
            expect(result.suggested_labels).toContain('bug');
        });

        it('should fall back to heuristics when LLM fails', async () => {
            mockClient.chat.completions.create.mockRejectedValue(new Error('API Error'));

            const result = await runIssueIntake({
                subject: 'Bug report',
                text: 'Crash on startup',
            });

            expect(result.type).toBe('bug');
            expect(result.confidence).toBe(0.3); // Heuristic confidence
        });

        it('should fall back when LLM returns empty response', async () => {
            mockClient.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: null } }],
            });

            const result = await runIssueIntake({
                subject: 'Test',
                text: 'Test',
            });

            expect(result.confidence).toBe(0.3);
        });

        it('should validate and sanitize LLM response', async () => {
            mockClient.chat.completions.create.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            type: 'invalid_type', // Invalid
                            severity: 'extreme', // Invalid
                            area: 'invalid', // Invalid
                            summary: 'A'.repeat(200), // Too long
                            repro_steps: 'Steps',
                            confidence: 2.0, // Out of range
                            suggested_labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], // Too many
                        }),
                    },
                }],
            });

            const result = await runIssueIntake({
                subject: 'Test',
                text: 'Test',
            });

            expect(result.type).toBe('question'); // Fallback
            expect(result.severity).toBe('minor'); // Fallback
            expect(result.area).toBe('unknown'); // Fallback
            expect(result.summary.length).toBeLessThanOrEqual(160);
            expect(result.confidence).toBe(1); // Clamped
            expect(result.suggested_labels.length).toBeLessThanOrEqual(5);
        });
    });
});
