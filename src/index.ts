import config from './config'
import logger from './logger'
import { SocketConnection } from './socket-manager/connection'

main();

async function main() {
    // backfill any async setup
    const socket = new SocketConnection({
        requireAuth: true,
        authToken: Buffer.from('testing').toString('base64'),
        authUrl: 'http://localhost:3000/connect',
        url: 'ws://localhost:3000/ws'
    });

    await socket.connect();
    socket.on('message', message => {
        const payload = JSON.parse(message);
        logger.info('[message]', { payload });
    });


    logger.info('consumer is connected');
}