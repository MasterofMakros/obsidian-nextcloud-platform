#!/usr/bin/env node
/**
 * Project Evolution Engine - Metrics Collector
 * Calibrated for TypeScript/pnpm/Vitest
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface Metrics {
    timestamp: string;
    llm_version: string;
    structure: {
        file_count: number;
        avg_lines: number;
        large_files: number;
    };
    documentation: {
        readme_count: number;
        doc_ratio: number;
        skill_readmes: number;
    };
    code_quality: {
        lint_errors: number;
        lint_warnings: number;
        type_errors: number;
    };
    agent_readiness: {
        skill_count: number;
        skill_compliance: number;
        avg_skill_tokens: number;
    };
    security: {
        critical_cves: number;
        high_cves: number;
        outdated_deps: number;
    };
    total_score: number;
}

function exec(cmd: string): string {
    try {
        return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    } catch {
        return '0';
    }
}

function countFiles(pattern: string): number {
    const result = exec(`fd ${pattern} --exclude node_modules --exclude dist | wc -l`);
    return parseInt(result) || 0;
}

function computeMetrics(llmVersion: string): Metrics {
    const tsFiles = countFiles('-e ts -e tsx');
    const mdFiles = countFiles('-e md');
    const skillCount = countFiles('SKILL.md .agent/skills');
    const readmeCount = countFiles('README.md .agent/skills');

    // Lint errors
    const lintOutput = exec('pnpm lint 2>&1 || true');
    const lintErrors = (lintOutput.match(/error/gi) || []).length;
    const lintWarnings = (lintOutput.match(/warning/gi) || []).length;

    // Type errors
    const typeOutput = exec('pnpm tsc --noEmit 2>&1 || true');
    const typeErrors = (typeOutput.match(/error TS/gi) || []).length;

    // Security
    let criticalCves = 0;
    let highCves = 0;
    try {
        const auditOutput = exec('pnpm audit --json 2>/dev/null || echo "{}"');
        const audit = JSON.parse(auditOutput);
        criticalCves = audit?.metadata?.vulnerabilities?.critical || 0;
        highCves = audit?.metadata?.vulnerabilities?.high || 0;
    } catch { }

    // Calculate scores (0-100)
    const structureScore = Math.max(0, 100 - (lintErrors * 2));
    const docsScore = mdFiles > 0 ? Math.min(100, (mdFiles / tsFiles) * 500) : 0;
    const codeScore = Math.max(0, 100 - (lintErrors + typeErrors) * 5);
    const agentScore = skillCount > 0 ? (readmeCount / skillCount) * 100 : 0;
    const securityScore = Math.max(0, 100 - (criticalCves * 50) - (highCves * 20));

    // Weighted total
    const totalScore = (
        structureScore * 0.15 +
        docsScore * 0.20 +
        codeScore * 0.30 +
        agentScore * 0.20 +
        securityScore * 0.15
    );

    return {
        timestamp: new Date().toISOString(),
        llm_version: llmVersion,
        structure: {
            file_count: tsFiles,
            avg_lines: 0, // Would need file reading
            large_files: 0,
        },
        documentation: {
            readme_count: readmeCount,
            doc_ratio: tsFiles > 0 ? (mdFiles / tsFiles) * 100 : 0,
            skill_readmes: readmeCount,
        },
        code_quality: {
            lint_errors: lintErrors,
            lint_warnings: lintWarnings,
            type_errors: typeErrors,
        },
        agent_readiness: {
            skill_count: skillCount,
            skill_compliance: skillCount > 0 ? (readmeCount / skillCount) * 100 : 0,
            avg_skill_tokens: 350, // Estimate
        },
        security: {
            critical_cves: criticalCves,
            high_cves: highCves,
            outdated_deps: 0,
        },
        total_score: Math.round(totalScore * 10) / 10,
    };
}

function saveMetrics(metrics: Metrics): void {
    const dir = 'project-metrics';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // Current metrics
    fs.writeFileSync(path.join(dir, 'metrics.json'), JSON.stringify(metrics, null, 2));

    // Append to history
    const historyPath = path.join(dir, 'history.csv');
    const historyLine = `${metrics.timestamp},${metrics.llm_version},${metrics.total_score}\n`;
    fs.appendFileSync(historyPath, historyLine);

    console.log(`✅ Metrics saved: Score = ${metrics.total_score}`);
}

// Main
const llmVersion = process.argv[2] || 'unknown';
console.log(`🔄 Computing metrics for LLM: ${llmVersion}`);
const metrics = computeMetrics(llmVersion);
saveMetrics(metrics);
console.log(JSON.stringify(metrics, null, 2));
