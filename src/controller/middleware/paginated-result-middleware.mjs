import { validationResult } from "express-validator";

export const paginatedResultMiddleware = (calculateTotalCountCallback, getResultCallback) => {
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
        const totalCount = await calculateTotalCountCallback();

        const result = {
            totalCount: totalCount,
            next: null,
            previous: null,
        };

        if ((page * limit) < totalCount) {
            result.next = {
                page: page + 1,
                limit: limit,
            };
        }

        if (offset > 0) {
            result.previous = {
                page: page - 1,
                limit: limit,
            };
        }

        result.data = await getResultCallback({ filter, limit, offset });

        return res.status(200).json(result);
    };
}
