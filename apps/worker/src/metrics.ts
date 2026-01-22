import http from "node:http";
import client from "prom-client";
import type { Job } from "bullmq";

/**
 * Worker metrics registry + HTTP server.
 * Exposes /metrics on WORKER_METRICS_PORT (default 9100)
 */

export type WorkerMetrics = {
    registry: client.Registry;
    jobsProcessedTotal: client.Counter<string>;
    jobDurationSeconds: client.Histogram<string>;
    queueWaitingCount: client.Gauge<string>;
    queueActiveCount: client.Gauge<string>;
    queueFailedCount?: client.Gauge<string>;
};

export function createWorkerMetrics(): WorkerMetrics {
    const registry = new client.Registry();

    client.collectDefaultMetrics({
        register: registry,
        prefix: "onm_",
    });

    const jobsProcessedTotal = new client.Counter({
        name: "onm_worker_jobs_processed_total",
        help: "Total worker jobs processed",
        labelNames: ["queue", "job_name", "result"] as const,
        registers: [registry],
    });

    const jobDurationSeconds = new client.Histogram({
        name: "onm_worker_job_duration_seconds",
        help: "Worker job duration in seconds",
        labelNames: ["queue", "job_name", "result"] as const,
        buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10],
        registers: [registry],
    });

    const queueWaitingCount = new client.Gauge({
        name: "onm_worker_queue_waiting_count",
        help: "Number of waiting jobs in queue",
        labelNames: ["queue"] as const,
        registers: [registry],
    });

    const queueActiveCount = new client.Gauge({
        name: "onm_worker_queue_active_count",
        help: "Number of active (processing) jobs in queue",
        labelNames: ["queue"] as const,
        registers: [registry],
    });

    const queueFailedCount = new client.Gauge({
        name: "onm_worker_queue_failed_count",
        help: "Number of failed jobs in queue",
        labelNames: ["queue"] as const,
        registers: [registry],
    });

    return {
        registry,
        jobsProcessedTotal,
        jobDurationSeconds,
        queueWaitingCount,
        queueActiveCount,
        queueFailedCount,
    };
}

export function startWorkerMetricsServer(metrics: WorkerMetrics): void {
    const port = Number(process.env.WORKER_METRICS_PORT || 9100);

    const server = http.createServer(async (req, res) => {
        try {
            if (req.url === "/health") {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify({ status: "ok" }));
                return;
            }

            if (req.url === "/metrics") {
                const body = await metrics.registry.metrics();
                res.statusCode = 200;
                res.setHeader("Content-Type", metrics.registry.contentType);
                res.end(body);
                return;
            }

            res.statusCode = 404;
            res.end("not_found");
        } catch {
            res.statusCode = 500;
            res.end("metrics_error");
        }
    });

    server.listen(port, "0.0.0.0", () => {
        console.log(`Worker metrics server running on port ${port}`);
    });
}

// --- Instrumentation Wrappers ---

type Processor<T = any> = (job: Job<T>) => Promise<any>;

export function instrumentProcessor<T>(
    metrics: WorkerMetrics,
    queueName: string,
    jobName: string,
    fn: Processor<T>
): Processor<T> {
    return async (job: Job<T>) => {
        const end = metrics.jobDurationSeconds.startTimer({
            queue: queueName,
            job_name: jobName,
            result: "completed", // will be overwritten on failure
        });

        try {
            const out = await fn(job);
            end({ queue: queueName, job_name: jobName, result: "completed" });
            metrics.jobsProcessedTotal.inc(
                { queue: queueName, job_name: jobName, result: "completed" },
                1
            );
            return out;
        } catch (err) {
            end({ queue: queueName, job_name: jobName, result: "failed" });
            metrics.jobsProcessedTotal.inc(
                { queue: queueName, job_name: jobName, result: "failed" },
                1
            );
            throw err;
        }
    };
}

export function markIdempotentSkip(
    metrics: WorkerMetrics,
    queueName: string,
    jobName: string
) {
    metrics.jobsProcessedTotal.inc(
        { queue: queueName, job_name: jobName, result: "skipped_idempotent" },
        1
    );
}

import type { Queue } from "bullmq";

export function startQueueDepthPolling(
    metrics: WorkerMetrics,
    queueName: string,
    queue: Queue,
    intervalMs = 10_000
) {
    const tick = async () => {
        try {
            const counts = await queue.getJobCounts("wait", "delayed", "active", "failed");
            metrics.queueWaitingCount.set({ queue: queueName }, counts.wait ?? 0);
            metrics.queueActiveCount.set({ queue: queueName }, counts.active ?? 0);
            if (metrics.queueFailedCount) {
                metrics.queueFailedCount.set({ queue: queueName }, counts.failed ?? 0);
            }
        } catch {
            // swallow
        }
    };

    tick();
    const handle = setInterval(tick, intervalMs);
    // optional: unref so it won't block exit
    // @ts-ignore
    handle.unref?.();
}
