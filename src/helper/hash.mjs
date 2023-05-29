import { createHash } from 'node:crypto'

export const sha256 = content => {
    return createHash('sha256').update(content).digest('hex');
}
