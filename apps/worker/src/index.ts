import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import {
    createWorkerMetrics,
    startWorkerMetricsServer,
    instrumentProcessor,
    markIdempotentSkip,
    startQueueDepthPolling
} from './metrics';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = { url: REDIS_URL };

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// --- Observability Setup ---
const metrics = createWorkerMetrics();
startWorkerMetricsServer(metrics);

console.log('Worker started...');

// Defined Queue and Job Names
const QUEUE_NAME = 'stripe-events';
const GENERIC_JOB_NAME = 'stripe-event'; // We treat all jobs in this queue as this type for metrics

// Core Processor Function
import { processStripeEventJob } from './stripeProcessor';

const processJob = async (job: any) => {
    const result = await processStripeEventJob({ prisma, job });
    if (result === 'skipped_idempotent') {
        markIdempotentSkip(metrics, QUEUE_NAME, GENERIC_JOB_NAME);
    }
    return result;
};

// Wrap processor with metrics
const instrumentedProcessor = instrumentProcessor(metrics, QUEUE_NAME, GENERIC_JOB_NAME, processJob);

// Create Worker
const worker = new Worker(QUEUE_NAME, instrumentedProcessor, { connection });

// Start Polling Queue Depth
startQueueDepthPolling(metrics, QUEUE_NAME, worker);

worker.on('completed', job => {
    console.log(`${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`${job?.id} has failed with ${err.message}`);
});

