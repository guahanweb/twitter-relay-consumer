import { EventEmitter } from 'node:events';
import { DAO } from '../dao'
import logger from '../logger'

export class MessageHandler extends EventEmitter {
    dao: DAO
    connected: boolean

    constructor(config) {
        super();
        this.connected = false;
        this.dao = new DAO(config);

        this.dao.on('error', (err: any) => {
            logger.warn(`redis: ${err.message}`, { err });
        });
    }

    async initialize() {
        try {
            await this.dao.connect();
        } catch (err: any) {
            throw err;
        }
    }

    async process(payload) {
        logger.info(`message`, payload);
    }
}
