import { Worker as BullWorker } from 'bullmq';
import path from "node:path";
import {fileURLToPath} from "node:url";
import { QUEUE_NAME as SCENARIO_QUEUE_NAME } from '../queue/scenario-queue.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scenarioQueueProcessorPath = path.join(__dirname, 'processor', 'scenario-queue-processor.cjs');

export class ScenarioWorkerFactory {
    #scenarioRepository;

    constructor({ scenarioRepository }) {
        this.#scenarioRepository = scenarioRepository;
    }

    create(options) {
        const worker = new BullWorker(
            SCENARIO_QUEUE_NAME,
            scenarioQueueProcessorPath,
            options,
        );

        worker.on('failed', async ({ job, failedReason }) => {
            if (job && job.data.scenarioId) {
                await this.#scenarioRepository.markAsFailed(job.data.scenarioId, failedReason);
            }
        });

        return worker;
    }
}
