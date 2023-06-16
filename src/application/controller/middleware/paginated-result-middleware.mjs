import { validationResult } from 'express-validator';
import { URL } from 'node:url';

export const paginatedResultMiddleware = (calculateTotalCountCallback, getResultCallback, applicationUrl) => {
    return async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'The request data is not valid',
                errors: errors.array(),
            });
        }

        try {
            const filter = req.query.filter || {};
            const page = parseInt(req.query.page);
            const limit = parseInt(req.query.limit);
            const offset = (page - 1) * limit;
            const totalCount = await calculateTotalCountCallback({ filter });
            const currentUrl = new URL(req.originalUrl, applicationUrl);

            const result = {
                totalCount: totalCount,
                next: null,
                previous: null,
            };

            if ((page * limit) < totalCount) {
                const nextPage = page + 1;
                const nextUrl = new URL(currentUrl.toString());
                nextUrl.searchParams.set('page', nextPage.toString());
                nextUrl.searchParams.set('limit', limit.toString());

                result.next = {
                    url: nextUrl.toString(),
                    page: nextPage,
                    limit: limit,
                };
            }

            if (offset > 0) {
                const previousPage = page - 1;
                const previousUrl = new URL(currentUrl.toString());
                previousUrl.searchParams.set('page', previousPage.toString());
                previousUrl.searchParams.set('limit', limit.toString());

                result.previous = {
                    url: previousUrl.toString(),
                    page: previousPage,
                    limit: limit,
                };
            }

            result.data = await getResultCallback({ filter, limit, offset });

            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    };
}
