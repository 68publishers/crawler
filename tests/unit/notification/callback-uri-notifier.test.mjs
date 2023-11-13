import nock from 'nock';
import { CallbackUriNotifier } from '../../../src/notification/callback-uri-notifier.mjs';
import { InMemoryLogger } from '../fixtures/in-memory-logger.mjs';

describe('Test CallbackUriNotifier', function () {
    it('HTTP uri should be notified without authentication', async () => {
        createNock({
            secured: false,
            contentLength: 15,
            responseCode: 200,
        });

        const logger = new InMemoryLogger();
        const notifier = new CallbackUriNotifier();

        await notifier.notify(
            'http://www.example.com/receive-result',
            {
                name: 'Test',
            },
            logger,
        );

        expect(logger.messages).toEqual([
            {
                verbosity: 'info',
                message: 'URL http://www.example.com/receive-result successfully notified. The client responded with a status code 200.',
            },
        ]);
    });

    it('HTTP uri should be notified with authentication', async () => {
        createNock({
            secured: false,
            contentLength: 15,
            responseCode: 200,
            authHeader: 'Basic cm9vdDpwYXNz',
        });

        const logger = new InMemoryLogger();
        const notifier = new CallbackUriNotifier();

        await notifier.notify(
            'http://www.example.com/receive-result',
            {
                name: 'Test',
            },
            logger,
            ['root', 'pass'],
        );

        expect(logger.messages).toEqual([
            {
                verbosity: 'info',
                message: 'URL http://www.example.com/receive-result successfully notified. The client responded with a status code 200.',
            },
        ]);
    });

    it('HTTPS uri should be notified without authentication', async () => {
        createNock({
            secured: true,
            contentLength: 15,
            responseCode: 200,
        });

        const logger = new InMemoryLogger();
        const notifier = new CallbackUriNotifier();

        await notifier.notify(
            'https://www.example.com/receive-result',
            {
                name: 'Test',
            },
            logger,
        );

        expect(logger.messages).toEqual([
            {
                verbosity: 'info',
                message: 'URL https://www.example.com/receive-result successfully notified. The client responded with a status code 200.',
            },
        ]);
    });

    it('HTTPS uri should be notified with authentication', async () => {
        createNock({
            secured: true,
            contentLength: 15,
            responseCode: 200,
            authHeader: 'Basic cm9vdDpwYXNz',
        });

        const logger = new InMemoryLogger();
        const notifier = new CallbackUriNotifier();

        await notifier.notify(
            'https://www.example.com/receive-result',
            {
                name: 'Test',
            },
            logger,
            ['root', 'pass'],
        );

        expect(logger.messages).toEqual([
            {
                verbosity: 'info',
                message: 'URL https://www.example.com/receive-result successfully notified. The client responded with a status code 200.',
            },
        ]);
    });

    it('Content-Length header should be correctly calculated for the unicode request body', async () => {
        createNock({
            secured: false,
            contentLength: 23, // {"name":"🔥Test🔥"} // 🔥 = 4 bytes
            responseCode: 200,
        });

        const logger = new InMemoryLogger();
        const notifier = new CallbackUriNotifier();

        await notifier.notify(
            'http://www.example.com/receive-result',
            {
                name: '🔥Test🔥',
            },
            logger,
        );

        expect(logger.messages).toEqual([
            {
                verbosity: 'info',
                message: 'URL http://www.example.com/receive-result successfully notified. The client responded with a status code 200.',
            },
        ]);
    });
});

const createNock = ({ secured, contentLength, responseCode, authHeader }) => {
    return nock(`http${secured ? 's' : ''}://www.example.com`)
        .post('/receive-result')
        .reply(function () {
            expect(this.req.method).toStrictEqual('POST');
            expect(this.req.headers['content-type']).toStrictEqual('application/json');
            expect(this.req.headers['content-length']).toStrictEqual(contentLength);
            expect(this.req.headers['authorization']).toStrictEqual(authHeader);

            return [responseCode, 200 === responseCode ? 'OK' : 'NOK'];
        });
};
