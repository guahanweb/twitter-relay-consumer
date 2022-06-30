interface HashtagEntity {
    start: number;
    end: number;
    tag: string;
}

const KEY = 'hashtags';

export function process(chain: any, payload: any) {
    try {
        const hashtags: HashtagEntity[] | undefined = payload?.data?.entities?.hashtags;
        if (hashtags && hashtags.length) {
            // if we have hashtags, chain our increments
            return hashtags.reduce((prev, { tag }) => {
                // case-insensitive counts
                const value = tag.toLowerCase();
                return prev.ZADD(KEY,
                    { score: 1, value },
                    { INCR: true }
                );
            }, chain);
        }

        // otherwise, just return the current chain
        return chain;
    } catch (err: any) {
        // could not process hashtags for some reason
        // for now, we just silently ignore
    }
}

export async function report(client, limit = 25) {
    const result = await client.ZRANGE_WITHSCORES(KEY, '+inf', '-inf', {
        BY: 'SCORE',
        REV: true,
        LIMIT: {
            offset: 0,
            count: limit,
        }
    });

    const o = {};
    result.forEach(({ value, score }) => o[value] = score);
    return o;
}
