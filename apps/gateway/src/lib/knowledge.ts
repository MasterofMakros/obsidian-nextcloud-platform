import fs from 'fs/promises';
import path from 'path';

// Cache structure
let knowledgeCache: string | null = null;
let lastCacheTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 Hour

// Base docs path (relative to this file in src/lib -> ../../../docs)
// In production (dist), it might be different, so we need to be careful.
// We assume the app is run from the root or apps/gateway directory.
// Better to rely on process.cwd() or an environment variable.
const DOCS_REL_PATH = '../../../docs';

/**
 * Loads the knowledge base from markdown files in the docs directory.
 * Caches the result in memory for CACHE_TTL.
 */
export async function loadKnowledgeBase(): Promise<string> {
    const now = Date.now();
    if (knowledgeCache && (now - lastCacheTime < CACHE_TTL)) {
        return knowledgeCache;
    }

    const docsPath = path.resolve(process.cwd(), process.env.DOCS_PATH || '../../docs'); // Default assumption: running from apps/gateway

    console.log(`[Knowledge] Loading docs from: ${docsPath}`);

    try {
        const files = await getMarkdownFiles(docsPath);

        let content = "# Knowledge Base\n\n";

        for (const file of files) {
            // Exclude n8n workflows and hidden folders
            if (file.includes(path.sep + 'n8n' + path.sep) || file.includes(path.sep + '.')) {
                continue;
            }

            const fileContent = await fs.readFile(file, 'utf-8');
            const relativeName = path.relative(docsPath, file);

            content += `## File: ${relativeName}\n\n${fileContent}\n\n---\n\n`;
        }

        knowledgeCache = content;
        lastCacheTime = now;
        console.log(`[Knowledge] Loaded ${files.length} files, total size: ${content.length} chars`);

        return content;
    } catch (error) {
        console.error("[Knowledge] Error loading knowledge base:", error);
        return "# Knowledge Base\n\nError loading documentation.";
    }
}

/**
 * Recursively finds markdown files
 */
async function getMarkdownFiles(dir: string): Promise<string[]> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const res = path.resolve(dir, entry.name);
        if (entry.isDirectory()) {
            // Skip node_modules and hidden directories
            if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;

            // Recurse
            const children = await getMarkdownFiles(res);
            files.push(...children);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(res);
        }
    }

    return files;
}
