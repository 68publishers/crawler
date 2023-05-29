import path from 'path';
import { fileURLToPath } from 'url';
import { createContainer, asClass, asValue, InjectionMode, asFunction } from 'awilix';
import { Application } from './application.mjs';
import { WinstonLogger } from './logger/winston-logger.mjs';
import { RouterFactory } from './routes/router-factory.mjs';
import { createActionRegistry } from './action/action-registry-factory.mjs';
import { Crawler } from './crawler/crawler.mjs';
import { CallbackUriNotifier } from './notification/callback-uri-notifier.mjs';

import { ScenarioController } from './controller/scenario/scenario-controller.mjs';
import { ScenarioValidator } from './controller/scenario/scenario-validator.mjs';

import { Database } from './model/database.mjs';
import { ScenarioRepository } from './model/scenario/scenario-repository.mjs';
import { UserRepository } from './model/user/user-repository.mjs';

import { ScenarioQueue } from './queue/scenario-queue.mjs';
import { Worker } from './worker/worker.mjs';

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
            injectionMode: InjectionMode.PROXY
        });

        container.register({
            varDir: asValue(path.resolve(__dirname, '..', 'var')),
            logDir: asValue(path.resolve(__dirname, '..', 'var', 'log')),
            developmentMode: asValue(process.env.NODE_ENV !== 'production'),
            applicationPort: asValue(process.env.APP_INTERNAL_PORT || 3030),
            applicationUrl: asValue(process.env.APP_URL || 'http://localhost:3000'),
            chromePath: asValue(process.env.CHROME_PATH || '/usr/bin/chromium-browser'),
            dbUrl: asValue(requireEnv('DB_URL')),
            redisHost: asValue(requireEnv('REDIS_HOST')),
            redisPort: asValue(requireEnv('REDIS_PORT')),
            redisAuth: asValue(requireEnv('REDIS_AUTH')),
            numberOfWorkerProcesses: asValue(parseInt(process.env.WORKER_PROCESSES || 1)),
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
            database: asClass(Database).singleton(),
            scenarioRepository: asClass(ScenarioRepository).singleton(),
            userRepository: asClass(UserRepository).singleton(),
            scenarioQueue: asClass(ScenarioQueue).singleton(),
            worker: asClass(Worker).singleton(),
        });

        return container;
    }
}
