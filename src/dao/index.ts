import { EventEmitter } from 'node:events';
import { RedisClientOptions } from "redis";
import redis = require('redis');

export class DAO extends EventEmitter {
    client: any;

    constructor(opts) {
        super();
        const client = redis.createClient({
            url: `redis://${opts.host}:${opts.port}`,
        } as RedisClientOptions);

        // bubble up the error for handling
        client.on('error', (err: any) => this.emit('error', err));
        this.client = client;
    }

    async connect() {
        return this.client.connect();
    }

    async disconnect() {
        return this.client.disconnect();
    }
}
