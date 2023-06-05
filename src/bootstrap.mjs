import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContainer, asClass, asValue, InjectionMode, asFunction } from 'awilix';
import { Application } from './application.mjs';
import { WinstonLogger } from './logger/winston-logger.mjs';
import { RouterFactory } from './routes/router-factory.mjs';
import { createActionRegistry } from './action/action-registry-factory.mjs';
import { Crawler } from './crawler/crawler.mjs';
import { CallbackUriNotifier } from './notification/callback-uri-notifier.mjs';

import { ScenarioController } from './controller/scenario/scenario-controller.mjs';
import { ScenarioValidator } from './controller/scenario/scenario-validator.mjs';

import { ScenarioSchedulerController } from './controller/scenario/scenario-scheduler-controller.mjs';
import { ScenarioSchedulerValidator } from './controller/scenario/scenario-scheduler-validator.mjs';

import { createDatabaseClient } from './model/database-client-factory.mjs';
import { ScenarioRepository } from './model/scenario/scenario-repository.mjs';
import { ScenarioSchedulerRepository } from './model/scenario/scenario-scheduler-repository.mjs';
import { UserRepository } from './model/user/user-repository.mjs';

import { ScenarioQueue } from './queue/scenario-queue.mjs';
import { ScenarioWorkerFactory } from './worker/scenario-worker-factory.mjs';
import { Worker } from './worker/worker.mjs';

import { Scheduler } from './scheduler/scheduler.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const requireEnv = name => {
    if (!(name in process.env)) {
        throw new Error(`The ENV variable ${name} not defined.`);
    }

    return process.env[name];
};

export class Bootstrap {
    static boot() {
        const container = createContainer({
            injectionMode: InjectionMode.PROXY,
        });

        container.register({
            varDir: asValue(path.resolve(__dirname, '..', 'var')),
            logDir: asValue(path.resolve(__dirname, '..', 'var', 'log')),
            developmentMode: asValue(process.env.NODE_ENV !== 'production'),
            applicationUrl: asValue(requireEnv('APP_URL')),
            applicationPort: asValue(requireEnv('APP_PORT')),
            chromePath: asValue(requireEnv('CHROME_PATH')),
            dbUrl: asValue(requireEnv('DB_URL')),
            redisHost: asValue(requireEnv('REDIS_HOST')),
            redisPort: asValue(requireEnv('REDIS_PORT')),
            redisAuth: asValue(requireEnv('REDIS_AUTH')),
            crawleeStorageDir: asValue(requireEnv('CRAWLEE_STORAGE_DIR')),
            numberOfWorkerProcesses: asValue(parseInt(requireEnv('WORKER_PROCESSES'))),
        });

        container.register({
            application: asClass(Application).singleton(),
            logger: asClass(WinstonLogger).singleton(),
            routerFactory: asClass(RouterFactory).singleton(),
            actionRegistry: asFunction(createActionRegistry).singleton(),
            crawler: asClass(Crawler).singleton(),
            callbackUriNotifier: asClass(CallbackUriNotifier).singleton(),
            scenarioController: asClass(ScenarioController).singleton(),
            scenarioValidator: asClass(ScenarioValidator).singleton(),
            scenarioSchedulerController: asClass(ScenarioSchedulerController).singleton(),
            scenarioSchedulerValidator: asClass(ScenarioSchedulerValidator).singleton(),
            databaseClient: asFunction(createDatabaseClient).singleton(),
            scenarioRepository: asClass(ScenarioRepository).singleton(),
            scenarioSchedulerRepository: asClass(ScenarioSchedulerRepository).singleton(),
            userRepository: asClass(UserRepository).singleton(),
            scenarioQueue: asClass(ScenarioQueue).singleton(),
            scenarioWorkerFactory: asClass(ScenarioWorkerFactory).singleton(),
            worker: asClass(Worker).singleton(),
            scheduler: asClass(Scheduler).singleton(),
        });

        return container;
    }
}
