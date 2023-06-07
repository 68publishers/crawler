import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

export class Application {
    #routerFactory;
    #logger;
    #worker;
    #scheduler;
    #applicationPort;
    #developmentMode;

    constructor({ routerFactory, logger, worker, scheduler, applicationPort, developmentMode }) {
        this.#routerFactory = routerFactory;
        this.#logger = logger;
        this.#worker = worker;
        this.#scheduler = scheduler;
        this.#applicationPort = applicationPort;
        this.#developmentMode = developmentMode;
    }

    run() {
        process.on('uncaughtException', async (err) => {
            await this.#logger.error(`Uncaught exception ${err.name}: ${err.message}\nStack: ${JSON.stringify(err.stack)}`);

            process.exit(1);
        });

        process.on('unhandledRejection', async (reason) => {
            await this.#logger.error(`Unhandled Rejection at: Promise. ${reason}`);
        });

        const app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(methodOverride());

        app.use(this.#routerFactory.create());

        // catch 404
        app.use((req, res, next) => {
            const err = new Error('Endpoint not found');
            err.status = 404;

            next(err);
        });

        // error handler
        // eslint-disable-next-line no-unused-vars
        app.use(async (err, req, res, next) => {
            await this.#logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`)

            if (res.headersSent) {
                return next(err)
            }

            res.status(err.status || 500);
            res.json({
                message: err.message || 'Something went wrong',
                stack: !this.#developmentMode ? '' : err.stack,
            });
        });

        this.#worker.run();
        this.#scheduler.run();

        const server = app.listen(this.#applicationPort, () => {
            console.log(`app listening on port ${this.#applicationPort}!`)
        });

        process.on('SIGTERM', () => {
            console.log('SIGTERM signal received: closing the application server.');

            server.close(async () => {
                await this.#worker.close();
                await this.#scheduler.close();

                process.exit(0);
            })
        })
    }
}
