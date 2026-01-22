import Fastify from "fastify";
import rateLimit from "@fastify/rate-limit";
import { randomUUID } from "crypto";
import auth from "./auth.js";
import {
    AgentRunRequest,
    IssueIntakeOutput,
    AnalysisOutput,
    FixProposalOutput,
} from "./schemas.js";
import { runIssueIntake } from "./tasks/issueIntake.js";
import { runAnalysis } from "./tasks/analysis.js";
import { runFixProposal } from "./tasks/fixProposal.js";

const app = Fastify({
    logger: {
        level: process.env.LOG_LEVEL || "info",
        redact: ["req.headers.authorization"],
    },
});

// Rate limiting
await app.register(rateLimit, { max: 60, timeWindow: "1 minute" });

// Auth plugin
await app.register(auth);

// Health endpoints
app.get("/health", async () => ({ status: "ok" }));
app.get("/readyz", async () => ({ status: "ready" }));

// Main agent endpoint
app.post("/v1/agent/run", async (req, reply) => {
    if (!app.requireAuth(req, reply)) return;

    const requestId = randomUUID();
    const start = Date.now();

    // Validate request
    const parsed = AgentRunRequest.safeParse(req.body);
    if (!parsed.success) {
        return reply.code(400).send({
            error: "invalid_request",
            details: parsed.error.flatten(),
        });
    }

    const { task, input } = parsed.data;

    try {
        let output: unknown;

        if (task === "issue_intake") {
            output = await runIssueIntake(input);
            const v = IssueIntakeOutput.safeParse(output);
            if (!v.success) {
                return reply.code(422).send({
                    error: "schema_validation_failed",
                    details: v.error.flatten(),
                });
            }
            output = v.data;
        }

        if (task === "analysis") {
            output = await runAnalysis(input);
            const v = AnalysisOutput.safeParse(output);
            if (!v.success) {
                return reply.code(422).send({
                    error: "schema_validation_failed",
                    details: v.error.flatten(),
                });
            }
            output = v.data;
        }

        if (task === "fix_proposal") {
            output = await runFixProposal(input);
            const v = FixProposalOutput.safeParse(output);
            if (!v.success) {
                return reply.code(422).send({
                    error: "schema_validation_failed",
                    details: v.error.flatten(),
                });
            }
            output = v.data;
        }

        return reply.send({
            task,
            output,
            meta: {
                request_id: requestId,
                model: "gateway-stub",
                latency_ms: Date.now() - start,
            },
        });
    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        req.log.error({ requestId, err: error.message }, "gateway_error");
        return reply.code(500).send({
            error: "internal_error",
            request_id: requestId,
        });
    }
});

// Start server
const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || "0.0.0.0";

try {
    await app.listen({ port, host });
    app.log.info(`Gateway listening on ${host}:${port}`);
} catch (err) {
    app.log.error(err);
    process.exit(1);
}
