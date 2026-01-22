import fp from "fastify-plugin";
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default fp(async (app: FastifyInstance) => {
    const token = process.env.GATEWAY_BEARER_TOKEN;
    if (!token) {
        app.log.warn("GATEWAY_BEARER_TOKEN not set, auth disabled for development");
    }

    app.decorate("requireAuth", (req: FastifyRequest, reply: FastifyReply): boolean => {
        // Skip auth if token not configured (dev mode)
        if (!token) return true;

        const auth = req.headers.authorization || "";
        const ok = auth === `Bearer ${token}`;
        if (!ok) {
            reply.code(401).send({ error: "unauthorized" });
            return false;
        }
        return true;
    });
});

declare module "fastify" {
    interface FastifyInstance {
        requireAuth: (req: FastifyRequest, reply: FastifyReply) => boolean;
    }
}
