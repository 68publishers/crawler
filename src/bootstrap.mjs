import path from 'path';
import { fileURLToPath } from 'url';
import {createContainer, asClass, asValue, InjectionMode, asFunction} from 'awilix';
import {Application} from './application.mjs';
import {WinstonLogger} from './logger/winston-logger.mjs';
import {RouterFactory} from './routes/router-factory.mjs';
import {createActionRegistry} from './action/action-registry-factory.mjs';
import {Crawler} from './crawler/crawler.mjs';

import {ScenarioController} from './controller/scenario/scenario-controller.mjs';
import {ScenarioValidator} from './controller/scenario/scenario-validator.mjs';

import {Database} from './model/database.mjs';
import {ScenarioRepository} from './model/scenario/scenario-repository.js';

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
            logDir: asValue(path.resolve(__dirname, '..', 'var', 'log')),
            developmentMode: asValue(process.env.NODE_ENV !== 'production'),
            applicationPort: asValue(process.env.APP_INTERNAL_PORT || 8080),
            chromePath: asValue(process.env.CHROME_PATH || '/usr/bin/chromium-browser'),
            dbUrl: asValue(requireEnv('DB_URL')),
        });

        container.register({
            application: asClass(Application).singleton(),
            logger: asClass(WinstonLogger).singleton(),
            routerFactory: asClass(RouterFactory).singleton(),
            actionRegistry: asFunction(createActionRegistry).singleton(),
            crawler: asClass(Crawler).singleton(),
            scenarioController: asClass(ScenarioController).singleton(),
            scenarioValidator: asClass(ScenarioValidator).singleton(),
            database: asClass(Database).singleton(),
            scenarioRepository: asClass(ScenarioRepository).singleton(),
        });

        return container;
    }
}
