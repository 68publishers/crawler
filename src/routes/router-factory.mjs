import express, { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { comparePassword } from '../helper/password.mjs';
import { BasicStrategy } from 'passport-http';
import passport from 'passport';
import cors from 'cors';

export class RouterFactory {
    #scenarioController;
    #scenarioSchedulerController;
    #scenarioQueue;
    #userRepository;

    constructor({
        scenarioController,
        scenarioSchedulerController,
        scenarioQueue,
        userRepository,
    }) {
        this.#scenarioController = scenarioController;
        this.#scenarioSchedulerController = scenarioSchedulerController;
        this.#scenarioQueue = scenarioQueue;
        this.#userRepository = userRepository;
    }

    create() {
        const router = Router();

        const apiRouter = Router();
        const scenariosRouter = Router();
        const scenarioSchedulersRouter = Router();
        const adminRouter = Router();

        passport.use('basic', new BasicStrategy(
            async (username, password, done) => {
                let user = null;

                try {
                    user = await this.#userRepository.getByUsername(username);
                } catch (err) {
                    return done(err);
                }

                if (null === user || !comparePassword(password, user.password)) {
                    return done(null, false);
                }

                return done(null, user);
            },
        ));

        apiRouter.use(cors());

        adminRouter.use(passport.authenticate('basic', { session: false }, undefined));
        apiRouter.use(passport.authenticate('basic', { session: false }, undefined));

        router.use('/static', express.static('public'))
        router.use('/admin', adminRouter);
        router.use('/api', apiRouter);
        apiRouter.use('/scenarios', scenariosRouter);
        apiRouter.use('/scenario-schedulers', scenarioSchedulersRouter);

        // scenario
        scenariosRouter.get('/', this.#scenarioController.listScenarios());
        scenariosRouter.get('/:scenarioId', this.#scenarioController.getScenario());

        scenariosRouter.post('/', this.#scenarioController.runScenario());
        scenariosRouter.post('/validate', this.#scenarioController.validateScenario());

        // scenario scheduler
        scenarioSchedulersRouter.get('/', this.#scenarioSchedulerController.listScenarioSchedulers());
        scenarioSchedulersRouter.get('/:scenarioSchedulerId', this.#scenarioSchedulerController.getScenarioScheduler());

        scenarioSchedulersRouter.post('/', this.#scenarioSchedulerController.createScenarioScheduler());
        scenarioSchedulersRouter.post('/validate', this.#scenarioSchedulerController.validateScenarioScheduler());

        scenarioSchedulersRouter.put('/:scenarioSchedulerId', this.#scenarioSchedulerController.updateScenarioScheduler());

        scenarioSchedulersRouter.delete('/:scenarioSchedulerId', this.#scenarioSchedulerController.deleteScenarioScheduler());

        // admin/queues
        adminRouter.use('/queues', this.#createAdminQueuesRouter('/admin/queues'));

        return router;
    }

    #createAdminQueuesRouter(basePath) {
        const bullBoardServerAdapter = new ExpressAdapter();
        const scenarioQueue = new BullMQAdapter(this.#scenarioQueue.queue);

        bullBoardServerAdapter.setBasePath(basePath);

        createBullBoard({
            queues: [
                scenarioQueue,
            ],
            serverAdapter: bullBoardServerAdapter,
            options: {
                uiConfig: {
                    boardTitle: 'Queues',
                    boardLogo: {path: '/static/images/logo.svg', width: '130px', height: '70px'},
                },
            },
        });

        return bullBoardServerAdapter.getRouter();
    }
}
