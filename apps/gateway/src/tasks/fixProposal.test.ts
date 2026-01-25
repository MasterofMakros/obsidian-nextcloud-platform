import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { runFixProposal } from './fixProposal.js';

// Mock the llm module
vi.mock('../llm.js', () => ({
    isLLMConfigured: vi.fn(),
    getOpenAIClient: vi.fn(),
}));

import { isLLMConfigured, getOpenAIClient } from '../llm.js';

describe('runFixProposal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Stub Response (no LLM)', () => {
        beforeEach(() => {
            vi.mocked(isLLMConfigured).mockReturnValue(false);
        });

        it('should return stub analysis when LLM not configured', async () => {
            const result = await runFixProposal({
                title: 'Fix sync issue',
                body: 'Media files are not syncing',
                labels: ['bug'],
                number: 42,
            });

            expect(result.risk).toBe('high');
            expect(result.confidence).toBe(0.1);
            expect(result.patch_unified_diff).toBeNull();
            expect(result.analysis_md).toContain('stub mode');
        });

        it('should include issue context in stub response', async () => {
            const result = await runFixProposal({
                title: 'Test Issue',
                body: 'Description',
                labels: ['bug', 'help-wanted'],
            });

            expect(result.analysis_md).toContain('Test Issue');
            expect(result.analysis_md).toContain('bug, help-wanted');
        });

        it('should handle empty input gracefully', async () => {
            const result = await runFixProposal({});

            expect(result.risk).toBe('high');
            expect(result.pr_title).toContain('Address issue');
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
                            analysis_md: '## Root Cause\nMemory leak in sync module',
                            risk: 'medium',
                            confidence: 0.85,
                            patch_unified_diff: '--- a/sync.ts\n+++ b/sync.ts\n@@ -1,1 +1,1 @@\n-bug\n+fix',
                            pr_title: 'fix: Resolve memory leak in sync',
                            pr_body: 'Fixes the memory leak issue.',
                        }),
                    },
                }],
            });

            const result = await runFixProposal({
                title: 'Memory leak',
                body: 'App crashes after long use',
                number: 100,
            });

            expect(result.risk).toBe('medium');
            expect(result.confidence).toBe(0.85);
            expect(result.patch_unified_diff).toContain('sync.ts');
            expect(result.pr_title).toContain('memory leak');
        });

        it('should fall back to stub when LLM fails', async () => {
            mockClient.chat.completions.create.mockRejectedValue(new Error('API Error'));

            const result = await runFixProposal({
                title: 'Test',
                body: 'Test',
            });

            expect(result.risk).toBe('high');
            expect(result.confidence).toBe(0.1);
        });

        it('should handle null patch from LLM', async () => {
            mockClient.chat.completions.create.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            analysis_md: 'Analysis only - no patch possible',
                            risk: 'high',
                            confidence: 0.6,
                            patch_unified_diff: null,
                            pr_title: 'fix: Address issue',
                            pr_body: 'Manual implementation needed.',
                        }),
                    },
                }],
            });

            const result = await runFixProposal({
                title: 'Complex issue',
                body: 'Needs manual review',
            });

            expect(result.patch_unified_diff).toBeNull();
            expect(result.analysis_md).toContain('no patch');
        });

        it('should validate risk level from LLM', async () => {
            mockClient.chat.completions.create.mockResolvedValue({
                choices: [{
                    message: {
                        content: JSON.stringify({
                            analysis_md: 'Test',
                            risk: 'invalid_risk',
                            confidence: 0.5,
                            patch_unified_diff: null,
                            pr_title: 'Test',
                            pr_body: 'Test',
                        }),
                    },
                }],
            });

            const result = await runFixProposal({
                title: 'Test',
                body: 'Test',
            });

            expect(result.risk).toBe('high'); // Fallback to high
        });
    });
});
