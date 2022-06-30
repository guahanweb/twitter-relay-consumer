import { EventEmitter } from 'node:events';
import { DAO } from '../dao'
import logger from '../logger'
import * as hashtags from './hashtags'
import * as rules from './rules'

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

    // for this demo, we will build a singular execution chain
    // and allow each helper processor to return a modified
    // version of the chain. upon completion, we will exec
    // them all at once.
    async process(payload) {
        let chain = this.dao.client.multi();
        chain = rules.process(chain, payload);
        chain = hashtags.process(chain, payload);
        await chain.exec();
    }

    // summary report for all the counts thus far
    async report() {
        const { client } = this.dao;
        const report: any = {};
        report.rules = await rules.report(client);
        report.hashtags = await hashtags.report(client);
        return report;
    }
}
