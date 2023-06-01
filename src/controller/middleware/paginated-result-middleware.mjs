import { validationResult } from "express-validator";
import { URL } from 'node:url';

export const paginatedResultMiddleware = (calculateTotalCountCallback, getResultCallback, applicationUrl) => {
    return async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array(),
            });
        }

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
            const nextUrl = new URL(currentUrl.toString());
            nextUrl.searchParams.set('page', (page + 1).toString());
            nextUrl.searchParams.set('limit', limit.toString());

            result.next = nextUrl.toString();
        }

        if (offset > 0) {
            const previousUrl = new URL(currentUrl.toString());
            previousUrl.searchParams.set('page', (page - 1).toString());
            previousUrl.searchParams.set('limit', limit.toString());

            result.previous = previousUrl.toString();
        }

        result.data = await getResultCallback({ filter, limit, offset });

        return res.status(200).json(result);
    };
}
