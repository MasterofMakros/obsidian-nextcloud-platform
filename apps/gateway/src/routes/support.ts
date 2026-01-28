import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { runSupportChat } from "../tasks/supportChat.js";

const BodySchema = z.object({
    query: z.string(),
    history: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string()
    })).optional().default([]),
});

const supportRoutes: FastifyPluginAsync = async (app) => {
    app.post("/v1/agent/support-chat", async (req, reply) => {
        // Validate Body
        const result = BodySchema.safeParse(req.body);
        if (!result.success) {
            return reply.status(400).send({ error: "Invalid body", details: result.error });
        }

        const { query, history } = result.data;

        try {
            const output = await runSupportChat({ query, history });
            return reply.send(output);
        } catch (error) {
            req.log.error(error);
            return reply.status(500).send({ error: "Internal Server Error" });
        }
    });
};

export default supportRoutes;
