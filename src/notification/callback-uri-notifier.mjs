import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { URL } from 'node:url';

export class CallbackUriNotifier {
    async notify(callbackUri, requestBody, logger, authCredentials = undefined) {
        const data = JSON.stringify(requestBody);

        try {
            const res = await new Promise ((resolve, reject) => {
                const headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data, 'utf8'),
                };

                if (Array.isArray(authCredentials) && 2 === authCredentials.length) {
                    headers['Authorization'] =  'Basic ' + Buffer.from(authCredentials[0] + ':' + authCredentials[1]).toString('base64');
                }

                const options = {
                    method: 'POST',
                    headers: headers,
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
            err.message = `Failed to notify ${callbackUri}. ` + err.message;

            await logger.error(err);
        }
    }
}
