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
        const app = express();

        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(methodOverride());

        app.use(this.#routerFactory.create());

        // catch 404
        app.use((req, res, next) => {
            const err = new Error('Not Found');
            err.status = 404;

            next(err);
        });

        // error handler
        app.use((err, req, res, next) => {
            this.#logger.error(JSON.stringify(err.stack));

            res.status(err.status || 500);
            res.json({
                message: err.message,
                error: !this.#developmentMode ? {} : err,
            });
        });

        app.listen(this.#applicationPort, () => {
            console.log(`app listening on port ${this.#applicationPort}!`)
        });
    }
}
