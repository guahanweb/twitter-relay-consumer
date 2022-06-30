interface RuleEntity {
    id: string;
    tag: string;
}

const KEY = 'rules'

export function process(chain: any, payload: any) {
    try {
        const rules: RuleEntity[] | undefined = payload?.matching_rules;
        if (rules && rules.length) {
            // if we have matching rules, chain our increments
            return rules.reduce((prev, { id, tag }) => {
                return prev.ZADD(KEY,
                    { score: 1, value: id },
                    { INCR: true },
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
        },
    });

    const o = {};
    result.forEach(({ value, score }) => o[value] = score);
    return o;
}
