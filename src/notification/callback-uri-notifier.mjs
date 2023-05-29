import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { URL } from 'url';

export class CallbackUriNotifier {
    async notify(callbackUri, requestBody, logger, authCredentials = undefined) {
        const data = JSON.stringify(requestBody);

        try {
            const res = await new Promise ((resolve, reject) => {
                const headers = {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
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
            await logger.error(`Failed to notify ${callbackUri}. ${err.toString()}`);
        }
    }
}
