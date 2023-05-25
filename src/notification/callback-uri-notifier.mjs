import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';

export class CallbackUriNotifier {
    async notify(callbackUri, requestBody, logger) {
        const data = JSON.stringify(requestBody);

        try {
            const res = await new Promise ((resolve, reject) => {
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                    }
                };
                const url = new URL(callbackUri);

                const req = 'https:' === url.protocol ? httpsRequest(url, options) : httpRequest(url, options);

                req.on('response', res => {
                    resolve(res);
                });

                req.on('error', err => {
                    reject(err);
                });

                req.write(data);
                req.end();
            });

            await logger.info(`URL ${callbackUri} successfully notified. The client responded with a status code ${res.statusCode}.`);
        } catch (err) {
            await logger.error(`Failed to notify ${callbackUri}. ${err.toString()}`);
        }
    }
}
