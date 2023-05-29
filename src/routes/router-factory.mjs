import express, { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { comparePassword } from '../helper/password.mjs';
import { BasicStrategy } from 'passport-http';
import passport from 'passport';

export class RouterFactory {
    #scenarioController;
    #scenarioQueue;
    #userRepository;

    constructor({
        scenarioController,
        scenarioQueue,
        userRepository,
    }) {
        this.#scenarioController = scenarioController;
        this.#scenarioQueue = scenarioQueue;
        this.#userRepository = userRepository;
    }

    create() {
        const router = Router();

        const apiRouter = Router();
        const scenarioRouter = Router();
        const adminRouter = Router();

        passport.use('basic', new BasicStrategy(
            async (username, password, done) => {
                let user = null;

                try {
                    user = await this.#userRepository.findByUsername(username);
                } catch (err) {
                    return done(err);
                }

                if (null === user || !comparePassword(password, user.password)) {
                    return done(null, false);
                }

                return done(null, user);
            }
        ));

        adminRouter.use(passport.authenticate('basic', { session: false }, undefined));
        apiRouter.use(passport.authenticate('basic', { session: false }, undefined));

        router.use('/static', express.static('public'))
        router.use('/admin', adminRouter);
        router.use('/api', apiRouter);
        apiRouter.use('/scenario', scenarioRouter);

        scenarioRouter.get('/:scenarioId', this.#scenarioController.getScenario());
        scenarioRouter.post('/', this.#scenarioController.scheduleScenario());
        scenarioRouter.post('/validate', this.#scenarioController.validateScenario());

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
