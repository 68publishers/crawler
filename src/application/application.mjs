import express from 'express';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

export class Application {
    #routerFactory;
    #logger;
    #applicationPort;
    #developmentMode;

    constructor({ routerFactory, logger, applicationPort, developmentMode }) {
        this.#routerFactory = routerFactory;
        this.#logger = logger;
        this.#applicationPort = applicationPort;
        this.#developmentMode = developmentMode;
    }

    run() {
        process.on('uncaughtException', async (err) => {
            err.message = '[application] ' +  err.message;
            await this.#logger.error(err);
            process.exit(1);
        });

        process.on('unhandledRejection', async (reason) => {
            await this.#logger.error(`[application] Unhandled Rejection at: Promise. ${reason}`);
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
            const status = err.status || 500;

            if (500 <= status) {
                await this.#logger.error(err);
            }

            if (res.headersSent) {
                return next(err);
            }

            res.status(err.status || 500);
            res.json({
                message: err.message || 'Something went wrong',
                stack: !this.#developmentMode ? '' : err.stack,
            });
        });

        const server = app.listen(this.#applicationPort, () => {
            console.log(`app listening on port ${this.#applicationPort}!`)
        });

        process.on('SIGTERM', () => {
            console.log('[application] SIGTERM signal received: closing the application server.');

            server.close(async () => {
                process.exit(0);
            })
        })
    }
}
